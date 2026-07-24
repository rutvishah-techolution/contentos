import { promises as fs } from "fs";
import path from "path";
import {
  WRITING_DIR,
  getCampaign,
  listPersonas,
  draftsDirPath,
  campaignLink,
  setCampaignStatus,
  readPersonaBody,
} from "@/lib/brain";
import { getResearchBundle } from "@/lib/research/read";
import { getKnowledgeContext } from "@/lib/knowledge";
import { callClaude } from "@/lib/models/claude";
import { callGemini } from "@/lib/models/gemini";
import { readStorylines } from "@/lib/storyline/storyline";
import { extractFigures } from "@/lib/research/verify";
import {
  Channel,
  CHANNEL_LABELS,
  CHANNEL_ORDER,
  ChatMsg,
  PieceKind,
  StorylineDoc,
} from "@/lib/storyline/types";

function intentGuidance(kind: PieceKind): string {
  return kind === "thought-leadership"
    ? `INTENT: Thought leadership. This is NOT a sales pitch — the value is the
insight. Do not pitch the service in the body. End with a smooth, SUBTLE one-line
mention of the service (the kind of problem we work on), never a hard sell.`
    : `INTENT: Campaign. The service is the hero after the villain, and the piece
ends on a soft, direct CTA to the service.`;
}

export type DraftStage = "draft1" | "draft2" | "final";
export const STAGE_LABEL: Record<DraftStage, string> = {
  draft1: "Draft 1",
  draft2: "Draft 2",
  final: "Final",
};
export const NEXT_STAGE: Record<DraftStage, DraftStage | null> = {
  draft1: "draft2",
  draft2: "final",
  final: null,
};

export interface FactTrace {
  total: number;
  traced: number;
  untraced: string[];
}

export interface DraftSource {
  title: string;
  url: string;
}

export interface DraftDoc {
  id: string;
  channel: Channel;
  kind: PieceKind;
  personaId: string;
  personaName: string;
  stage: DraftStage;
  content: string; // the current stage's copy
  drafts: Partial<Record<DraftStage, string>>; // snapshots per stage
  factTrace: FactTrace;
  sources: DraftSource[]; // the research sources behind this piece
  chat: ChatMsg[]; // the Gemini help-assistant conversation
  approved: boolean; // final approved
  generatedAt: string;
}

async function readWriting(file: string): Promise<string> {
  try {
    return await fs.readFile(path.join(WRITING_DIR, file), "utf8");
  } catch {
    return "";
  }
}
function draftPath(slug: string, id: string): string {
  return path.join(draftsDirPath(slug), `${id}.md`);
}

const GROUNDING = `Use ONLY facts, figures, and companies present in the VERIFIED
RESEARCH provided. Never invent a statistic or claim not in it. You have NO web access.`;

const SOURCE_BALANCE = `Do NOT lean on a single source or the same headline stat
throughout. Vary the evidence — pull from different sources across the piece, and
never cite the same study more than once.`;

// ── The three passes ─────────────────────────────────────────────────────────
async function writePass(
  sl: StorylineDoc,
  campaign: { name: string; topic: string },
  research: string,
  voice: string,
  fw: Record<string, string>,
  instructions = "",
): Promise<string> {
  const chan = CHANNEL_LABELS[sl.channel];
  const s = sl.storyline;
  const system = `You write B2B campaign content as a specific persona.

${GROUNDING}

${SOURCE_BALANCE}

${intentGuidance(sl.kind)}

STORYLINE STRUCTURE:
${fw.structure}

CHANNEL FORMAT RULES (follow the rules for ${chan}):
${fw.formats}

BRAND:
${fw.brand}

YOUR VOICE (write as this persona):
${voice}

STRUCTURE governs shape; PERSONA governs voice. On conflict, keep structure.`;
  const user = `CAMPAIGN: ${campaign.name} — ${campaign.topic}

APPROVED STORYLINE (follow it):
Headline: ${s.headline}
Hook: ${s.hook}
Villain: ${s.villain}
Shift: ${s.shift}
Hero: ${s.hero}
Proof: ${s.proof}
Learning: ${s.learning}
CTA: ${s.cta}

VERIFIED RESEARCH (your only source of facts):
${research}
${
  instructions
    ? `\nUSER INSTRUCTIONS FOR THIS DRAFT (follow these):\n${instructions}\n`
    : ""
}
Write the full ${chan} piece, following the ${chan} format rules exactly.
Output ONLY the piece as clean Markdown — no preamble.`;
  return (await callClaude({ system, user, maxTokens: 3000, webSearch: false })).trim();
}

async function editPass(
  content: string,
  research: string,
  fw: Record<string, string>,
): Promise<string> {
  const system = `You are a sharp editor. Tighten this draft to enforce these rules, WITHOUT adding new facts and WITHOUT losing the persona's voice:

${fw.craft}

${fw.psych}

Output ONLY the edited piece as Markdown.`;
  return (
    await callClaude({
      system,
      user: `RESEARCH (facts must stay grounded here):\n${research}\n\nDRAFT:\n${content}`,
      maxTokens: 3000,
      webSearch: false,
    })
  ).trim();
}

async function humanizePass(
  content: string,
  fw: Record<string, string>,
): Promise<string> {
  const system = `${fw.humanizer}\n\nEdit only. Do not add new facts. Keep the persona's voice. Output ONLY the final piece as Markdown.`;
  return (
    await callClaude({
      system,
      user: `FINAL PASS on this piece:\n\n${content}`,
      maxTokens: 3000,
      webSearch: false,
    })
  ).trim();
}

// ── Generate Draft 1 for every approved storyline ────────────────────────────
export async function generateDrafts(
  slug: string,
  instructions = "",
): Promise<DraftDoc[]> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);
  const storylines = (await readStorylines(slug)).filter((s) => s.approved);
  if (storylines.length === 0) throw new Error("Approve at least one storyline first.");
  const bundle = await getResearchBundle(slug);
  const campaignMd = bundle.campaignBase?.markdown || "";
  const scoutMd = bundle.scoutBase?.markdown || "";
  const brand = await readWriting("brand-context.md");
  const knowledge = await getKnowledgeContext(6000);
  const researchFor = (kind: PieceKind) =>
    kind === "thought-leadership"
      ? [campaignMd, scoutMd, knowledge].filter(Boolean).join("\n\n──────\n\n")
      : campaignMd;
  // the sources behind each kind (campaign-only, or +scout for thought leadership)
  const dedupeSources = (entries: { title: string; url: string }[]) => {
    const seen = new Set<string>();
    const out: DraftSource[] = [];
    for (const e of entries) {
      if (!e.url || seen.has(e.url)) continue;
      seen.add(e.url);
      out.push({ title: e.title || e.url, url: e.url });
    }
    return out;
  };
  const sourcesFor = (kind: PieceKind) =>
    dedupeSources([
      ...(bundle.sources?.campaign || []),
      ...(kind === "thought-leadership" ? bundle.sources?.scout || [] : []),
    ]);

  const fw = {
    structure: await readWriting("storyline-structure.md"),
    formats: await readWriting("format-rules.md"),
    brand,
  };
  const personas = await listPersonas();
  const pathById = new Map(personas.map((p) => [p.id, p.path]));

  const docs = await Promise.all(
    storylines.map(async (sl) => {
      // skip if a draft already exists (don't clobber in-progress work)
      const existing = await readDraft(slug, sl.id);
      if (existing) return existing;
      const research = researchFor(sl.kind);
      const voice = pathById.get(sl.personaId)
        ? await readPersonaBody(pathById.get(sl.personaId) as string)
        : "";
      const content = await writePass(
        sl,
        { name: campaign.name, topic: campaign.topic },
        research,
        voice,
        fw,
        instructions,
      );
      const doc: DraftDoc = {
        id: sl.id,
        channel: sl.channel,
        kind: sl.kind,
        personaId: sl.personaId,
        personaName: sl.personaName,
        stage: "draft1",
        content,
        drafts: { draft1: content },
        factTrace: traceFacts(content, `${research}\n\n${brand}`),
        sources: sourcesFor(sl.kind),
        chat: [],
        approved: false,
        generatedAt: new Date().toISOString(),
      };
      await writeDraft(slug, doc);
      return doc;
    }),
  );
  await setCampaignStatus(slug, "drafting");
  return docs;
}

/** Advance a piece to the next draft stage (draft1→draft2 edit, draft2→final humanize). */
export async function advanceDraft(slug: string, id: string): Promise<DraftDoc> {
  const doc = await readDraft(slug, id);
  if (!doc) throw new Error("Draft not found.");
  const next = NEXT_STAGE[doc.stage];
  if (!next) throw new Error("Already at final.");
  const research = researchForKind(await getResearchBundle(slug), doc.kind, "");
  const fw = {
    craft: await readWriting("craft-rules.md"),
    psych: await readWriting("reader-psychology.md"),
    humanizer: await readWriting("humanizer.md"),
  };

  const content =
    next === "draft2"
      ? await editPass(doc.content, research, fw)
      : await humanizePass(doc.content, fw);

  doc.stage = next;
  doc.content = content;
  doc.drafts[next] = content;
  doc.factTrace = traceFacts(content, await traceCorpus(slug, doc.kind));
  await writeDraft(slug, doc);
  return doc;
}

/** Facts a piece may draw on: campaign only, or wider (scout) for thought leadership. */
function researchForKind(
  bundle: Awaited<ReturnType<typeof getResearchBundle>>,
  kind: PieceKind,
  knowledge: string,
): string {
  const campaignMd = bundle.campaignBase?.markdown || "";
  if (kind !== "thought-leadership") return campaignMd;
  return [campaignMd, bundle.scoutBase?.markdown || "", knowledge]
    .filter(Boolean)
    .join("\n\n──────\n\n");
}

/** Manual edit of the current stage's content. */
export async function editDraft(
  slug: string,
  id: string,
  content: string,
): Promise<DraftDoc> {
  const doc = await readDraft(slug, id);
  if (!doc) throw new Error("Draft not found.");
  doc.content = content;
  doc.drafts[doc.stage] = content;
  doc.factTrace = traceFacts(content, await traceCorpus(slug, doc.kind));
  await writeDraft(slug, doc);
  return doc;
}

/** The Gemini help-assistant: answers, fact-checks, and edits on request. */
export async function assistDraft(
  slug: string,
  id: string,
  message: string,
): Promise<DraftDoc> {
  const doc = await readDraft(slug, id);
  if (!doc) throw new Error("Draft not found.");
  const bundle = await getResearchBundle(slug);
  const research = researchForKind(bundle, doc.kind, await getKnowledgeContext(6000));
  const sourceList = [
    ...(bundle.sources?.campaign || []),
    ...(bundle.sources?.scout || []),
  ]
    .map((s) => `- ${s.title} (${s.url})`)
    .join("\n");

  const system = `You are a helpful writing assistant reviewing a B2B content draft with the writer. You can:
- answer questions about the draft
- FACT-CHECK figures/claims against the VERIFIED RESEARCH and its sources (and the web)
- suggest improvements

If — and ONLY if — the user explicitly asks you to change the draft, output the full revised draft after a line containing exactly "---DRAFT---". Otherwise, do not include that marker. Keep any facts grounded in the research; flag anything that looks unsupported.`;

  const history = doc.chat
    .map((m) => `${m.role === "user" ? "USER" : "YOU"}: ${m.content}`)
    .join("\n");
  const priorStages = (Object.keys(doc.drafts) as DraftStage[])
    .filter((s) => s !== doc.stage && doc.drafts[s])
    .map((s) => `--- ${STAGE_LABEL[s]} ---\n${doc.drafts[s]}`)
    .join("\n\n");
  const user = `VERIFIED RESEARCH:
${research}

SOURCES:
${sourceList || "(none)"}

EARLIER DRAFT VERSIONS (use these if the user asks what changed between drafts):
${priorStages || "(none yet — this is the first draft)"}

CURRENT DRAFT (${STAGE_LABEL[doc.stage]}):
${doc.content}

CONVERSATION SO FAR:
${history || "(none)"}

USER MESSAGE:
"${message}"`;

  const raw = await callGemini({ system, user, maxTokens: 3000 });
  const [replyPart, draftPart] = raw.split(/---DRAFT---/);
  const reply = (replyPart || raw).trim();
  doc.chat.push({ role: "user", content: message });
  doc.chat.push({ role: "assistant", content: reply.slice(0, 4000) });
  if (draftPart && draftPart.trim().length > 40) {
    doc.content = draftPart.trim();
    doc.drafts[doc.stage] = doc.content;
    doc.factTrace = traceFacts(doc.content, await traceCorpus(slug, doc.kind));
  }
  await writeDraft(slug, doc);
  return doc;
}

export async function approveDraft(
  slug: string,
  id: string,
): Promise<{ allApproved: boolean }> {
  const doc = await readDraft(slug, id);
  if (!doc) throw new Error("Draft not found.");
  if (doc.stage !== "final") throw new Error("Advance to the final draft first.");
  doc.approved = true;
  await writeDraft(slug, doc);
  const all = await readDrafts(slug);
  const allApproved = all.length > 0 && all.every((d) => d.approved);
  if (allApproved) await setCampaignStatus(slug, "done");
  return { allApproved };
}

export async function readDrafts(slug: string): Promise<DraftDoc[]> {
  const dir = draftsDirPath(slug);
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const docs: DraftDoc[] = [];
  for (const f of files) {
    const d = await readDraft(slug, f.replace(/\.md$/, ""));
    if (d) docs.push(d);
  }
  return docs.sort(
    (a, b) =>
      (CHANNEL_ORDER.indexOf(a.channel) + 1 || 9) -
      (CHANNEL_ORDER.indexOf(b.channel) + 1 || 9),
  );
}

/** The corpus a draft's figures are allowed to trace to (wider for TL pieces). */
async function traceCorpus(slug: string, kind: PieceKind): Promise<string> {
  const bundle = await getResearchBundle(slug);
  const brand = await readWriting("brand-context.md");
  const parts = [bundle.campaignBase?.markdown || "", brand];
  if (kind === "thought-leadership") {
    parts.push(bundle.scoutBase?.markdown || "", await getKnowledgeContext(6000));
  }
  return parts.filter(Boolean).join("\n\n");
}

function traceFacts(copy: string, corpus: string): FactTrace {
  const figs = extractFigures(copy);
  const lower = corpus.toLowerCase();
  const untraced: string[] = [];
  let traced = 0;
  for (const f of figs) {
    if (f.variants.some((v) => lower.includes(v))) traced++;
    else untraced.push(f.label);
  }
  return { total: figs.length, traced, untraced: [...new Set(untraced)] };
}

async function writeDraft(slug: string, doc: DraftDoc): Promise<void> {
  await fs.mkdir(draftsDirPath(slug), { recursive: true });
  const md = [
    "---",
    campaignLink(slug),
    `pieceId: ${doc.id}`,
    `channel: ${doc.channel}`,
    `kind: ${doc.kind}`,
    `persona: ${doc.personaName}`,
    `stage: ${doc.stage}`,
    `approved: ${doc.approved}`,
    `factTrace: ${doc.factTrace.traced}/${doc.factTrace.total} traced`,
    "---",
    "",
    `# ${CHANNEL_LABELS[doc.channel]} — ${STAGE_LABEL[doc.stage]}`,
    "",
    doc.content,
    "",
    "## Data",
    "",
    "```json",
    JSON.stringify(doc, null, 2),
    "```",
    "",
  ].join("\n");
  await fs.writeFile(draftPath(slug, doc.id), md, "utf8");
}

async function readDraft(slug: string, id: string): Promise<DraftDoc | null> {
  try {
    const md = await fs.readFile(draftPath(slug, id), "utf8");
    const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
    return block ? (JSON.parse(block[1]) as DraftDoc) : null;
  } catch {
    return null;
  }
}
