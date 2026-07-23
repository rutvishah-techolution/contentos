import { promises as fs } from "fs";
import path from "path";
import { WRITING_DIR, listPersonas, readPersonaBody } from "@/lib/brain";
import { getKnowledgeContext } from "@/lib/knowledge";
import { groundedRaw } from "@/lib/models/gemini";
import { callClaude } from "@/lib/models/claude";
import { fetchUrl } from "@/lib/research/fetchSource";
import { sourceTier, extractFigures } from "@/lib/research/verify";
import {
  syncDigest,
  getDigestIndex,
  normalizeUrl,
} from "@/lib/integrations/digest";
import { getBeats } from "@/lib/news/beats";
import {
  readSeen,
  addSeen,
  writeSignal,
  readSignal,
  readSignals,
} from "@/lib/news/store";
import {
  searchPrompt,
  triageSystem,
  triageUser,
  draftSystem,
} from "@/lib/news/prompts";
import {
  Recommendation,
  Signal,
  TimeSensitivity,
} from "@/lib/news/types";

const AUTO_DRAFT_TOP = 3; // auto-draft this many "post-now" signals per scan

async function readWriting(file: string): Promise<string> {
  try {
    return await fs.readFile(path.join(WRITING_DIR, file), "utf8");
  } catch {
    return "";
  }
}
function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function newId(): string {
  return `sig-${Math.random().toString(36).slice(2, 8)}`;
}
function num(v: unknown, d = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : d;
}
function carouselRules(formats: string): string {
  const m = formats.match(/##\s*LinkedIn carousel[\s\S]*?(?=\n##\s|$)/i);
  return m ? m[0] : formats;
}

export interface ScanResult {
  created: Signal[];
  drafted: number;
  skipped: number;
}

/** The whole scan: live search + digest → skeptical triage → source-check → store. */
export async function scan(): Promise<ScanResult> {
  const brand = await readWriting("brand-context.md");
  const beats = (await getBeats()).filter((b) => b.active);
  const personas = (await listPersonas()).filter((p) => p.stream === "scout");
  const scoutList = personas.map((p) => `- id:"${p.id}" | ${p.name}`).join("\n");
  const nameById = new Map(personas.map((p) => [p.id, p.name]));

  // 1. live search per beat (parallel)
  const findingBlocks = await Promise.all(
    beats.map(async (b) => {
      const text = await groundedRaw(searchPrompt(b, brand));
      return `### BEAT ${b.id} — ${b.label}\n${text}`;
    }),
  );
  const findings = findingBlocks.join("\n\n");

  // 2. recent digest items as extra candidates
  await syncDigest().catch(() => null);
  const digestItems = [...(await getDigestIndex()).values()].slice(0, 15);
  const digestBlock = digestItems
    .map((d) => `- ${d.headline} — ${d.summary} (${d.url}) [${d.date}]`)
    .join("\n");

  const seen = await readSeen();
  const seenList = [...seen].slice(-80).join("\n");

  // 3. skeptical triage (one Claude call)
  const raw = await callClaude({
    system: triageSystem(brand),
    user: triageUser(scoutList, findings, digestBlock, seenList),
    maxTokens: 8000,
    webSearch: false,
  });
  const parsed = safeParse(raw.match(/\{[\s\S]*\}/)?.[0] || "");
  const items = Array.isArray(parsed?.signals) ? parsed!.signals : [];

  // 4. keep actionable items, source-check each
  const created: Signal[] = [];
  const newUrls: string[] = [];
  let skipped = 0;
  for (const it of items as Record<string, unknown>[]) {
    const rec = String(it.recommendation || "skip") as Recommendation;
    const url = String(it.url || "").trim();
    if (rec === "skip" || !/^https?:\/\//i.test(url)) {
      skipped++;
      continue;
    }
    if (seen.has(normalizeUrl(url))) {
      skipped++;
      continue;
    }
    // source-check: must resolve and not be dead
    const fetched = await fetchUrl(url);
    if (!fetched.ok || fetched.dead) {
      skipped++;
      continue;
    }
    const finalUrl = fetched.finalUrl || url;
    if (seen.has(normalizeUrl(finalUrl)) || newUrls.includes(normalizeUrl(finalUrl))) {
      skipped++;
      continue;
    }
    const personaId = String(it.personaId || personas[0]?.id || "");
    const beat = beats.find((b) => b.id === String(it.beatId)) || beats[0];
    const s: Signal = {
      id: newId(),
      beatId: beat?.id || "",
      beatLabel: beat?.label || "General",
      headline: String(it.headline || fetched.title || "Untitled"),
      summary: String(it.summary || ""),
      url: finalUrl,
      source: domainOf(finalUrl),
      tier: sourceTier(finalUrl),
      publishedAt: String(it.publishedAt || fetched.publishedAt || ""),
      timeSensitivity: (["breaking", "this-week", "evergreen"].includes(
        String(it.timeSensitivity),
      )
        ? it.timeSensitivity
        : "this-week") as TimeSensitivity,
      relevance: num(it.relevance),
      angleStrength: num(it.angleStrength),
      priority: num(it.priority),
      recommendation: rec,
      why: String(it.why || ""),
      suggestedAngle: String(it.suggestedAngle || ""),
      personaId,
      personaName: nameById.get(personaId) || personaId,
      status: "new",
      scannedAt: new Date().toISOString(),
    };
    await writeSignal(s);
    created.push(s);
    newUrls.push(normalizeUrl(finalUrl));
  }
  await addSeen(newUrls);

  // 5. auto-draft the top "post-now" signals
  const toDraft = created
    .filter((s) => s.recommendation === "post-now")
    .sort((a, b) => b.priority - a.priority)
    .slice(0, AUTO_DRAFT_TOP);
  for (const s of toDraft) await draftSignal(s.id);

  return { created, drafted: toDraft.length, skipped };
}

/** Write the light LinkedIn fast-take for one signal. */
export async function draftSignal(id: string): Promise<Signal> {
  const s = await readSignal(id);
  if (!s) throw new Error("Signal not found.");
  const [brand, formats, humanizer, knowledge] = await Promise.all([
    readWriting("brand-context.md"),
    readWriting("format-rules.md"),
    readWriting("humanizer.md"),
    getKnowledgeContext(5000),
  ]);
  const personas = await listPersonas();
  const pPath = personas.find((p) => p.id === s.personaId)?.path;
  const voice = pPath ? await readPersonaBody(pPath) : "";

  const user = `NEWS ITEM:
Headline: ${s.headline}
Summary: ${s.summary}
Source: ${s.url}
Our angle: ${s.suggestedAngle}

COMPANY KNOWLEDGE (extra facts you may use):
${knowledge || "(none)"}

Write the LinkedIn CAROUSEL now — our POV on this news, in your voice, as numbered
slides (### Slide 1 … up to 8) plus the caption. Output ONLY the carousel.`;
  const written = (
    await callClaude({
      system: draftSystem(voice, brand, carouselRules(formats)),
      user,
      maxTokens: 1400,
      webSearch: false,
    })
  ).trim();
  const finalCopy = (
    await callClaude({
      system: `${humanizer}\n\nEdit only. No new facts. Keep the voice. Output ONLY the post.`,
      user: `FINAL PASS:\n\n${written}`,
      maxTokens: 1400,
      webSearch: false,
    })
  ).trim();

  const corpus = `${s.summary}\n\n${knowledge}\n\n${brand}`.toLowerCase();
  const figs = extractFigures(finalCopy);
  const untraced = figs
    .filter((f) => !f.variants.some((v) => corpus.includes(v)))
    .map((f) => f.label);
  s.draft = {
    content: finalCopy,
    factTrace: {
      total: figs.length,
      traced: figs.length - untraced.length,
      untraced: [...new Set(untraced)],
    },
    chat: [],
    approved: false,
  };
  s.status = "drafted";
  await writeSignal(s);
  return s;
}

export async function approveSignal(id: string, approved = true): Promise<Signal> {
  const s = await readSignal(id);
  if (!s) throw new Error("Signal not found.");
  if (!s.draft) throw new Error("Draft it first.");
  s.draft.approved = approved;
  s.status = approved ? "approved" : "drafted";
  await writeSignal(s);
  return s;
}

export async function dismissSignal(id: string): Promise<void> {
  const s = await readSignal(id);
  if (!s) return;
  s.status = "dismissed";
  await writeSignal(s);
}

export async function editSignalDraft(id: string, content: string): Promise<Signal> {
  const s = await readSignal(id);
  if (!s || !s.draft) throw new Error("No draft.");
  s.draft.content = content;
  await writeSignal(s);
  return s;
}

export { readSignals };

function safeParse(str: string): { signals?: unknown[] } | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
