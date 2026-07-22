import { promises as fs } from "fs";
import path from "path";
import {
  WRITING_DIR,
  getCampaign,
  listPersonas,
  topicBankPath,
  storylineDirPath,
  campaignLink,
  readPersonaBody,
} from "@/lib/brain";
import { getResearchBundle } from "@/lib/research/read";
import { callClaude } from "@/lib/models/claude";
import { Channel, CHANNEL_LABELS } from "@/lib/storyline/types";

export type TopicStatus = "available" | "in-production";

/** One topic option on the shelf. `id` doubles as the piece id downstream. */
export interface Topic {
  id: string;
  channel: Channel;
  personaId: string;
  personaName: string;
  angle: string;
  headline: string;
  rationale: string;
  status: TopicStatus;
  generatedAt: string;
}

export interface TopicBank {
  spine: string;
  topics: Topic[];
  updatedAt: string;
}

const PER_CHANNEL = 4; // at least this many options per channel

async function readWriting(file: string): Promise<string> {
  try {
    return await fs.readFile(path.join(WRITING_DIR, file), "utf8");
  } catch {
    return "";
  }
}
function personaEssence(body: string): string {
  const paras = body
    .split(/\n{2,}/)
    .map((p) => p.replace(/^#+.*$/gm, "").replace(/^>/gm, "").trim())
    .filter((p) => p.length > 60 && !p.startsWith("---"));
  return (paras[0] || "").slice(0, 300);
}
function newId(channel: Channel): string {
  return `${channel}-${Math.random().toString(36).slice(2, 8)}`;
}
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function readTopicBank(slug: string): Promise<TopicBank | null> {
  try {
    const md = await fs.readFile(topicBankPath(slug), "utf8");
    const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
    return block ? (JSON.parse(block[1]) as TopicBank) : null;
  } catch {
    return null;
  }
}

/**
 * Generates ≥4 distinct topic options per channel and ADDS them to the shelf
 * (deduped against what's there). Grounded strictly in the approved research.
 */
export async function generateTopics(
  slug: string,
  channels: Channel[],
  feedback = "",
): Promise<TopicBank> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);
  const bundle = await getResearchBundle(slug);
  if (!bundle.campaignBase) throw new Error("Approve research first.");

  const planChannels: Channel[] = [
    "longform",
    ...channels.filter((c) => c !== "longform"),
  ];

  const [structure, angles, brand] = await Promise.all([
    readWriting("storyline-structure.md"),
    readWriting("content-angles.md"),
    readWriting("brand-context.md"),
  ]);
  const personas = await listPersonas();
  const roster = await Promise.all(
    personas.map(async (p) => ({
      id: p.id,
      name: p.name,
      essence: personaEssence(await readPersonaBody(p.path)),
    })),
  );
  const nameById = new Map(roster.map((r) => [r.id, r.name]));

  const existing = (await readTopicBank(slug))?.topics || [];
  const existingHeadlines = existing.map((t) => `- [${t.channel}] ${t.headline}`);

  const system = `You are a B2B content strategist proposing topic options for a campaign.

════════ ANTI-HALLUCINATION — ABSOLUTE ════════
Ground EVERY option strictly in the VERIFIED RESEARCH below. Never invent a
statistic, company, or claim not present in it.

════════ HOW TO PLAN ════════
${structure}

${angles}

════════ BRAND ════════
${brand}`;

  const channelLabels = planChannels.map((c) => CHANNEL_LABELS[c]).join(", ");
  const roleList = roster
    .map((r) => `- id:"${r.id}" | ${r.name} — ${r.essence}`)
    .join("\n");
  const revision = feedback
    ? `\n\nREVISION NOTE — take this into account:\n"${feedback}"\n`
    : "";
  const avoid = existingHeadlines.length
    ? `\n\nAVOID repeating these topics already on the shelf:\n${existingHeadlines.join("\n")}\n`
    : "";

  const user = `CAMPAIGN: ${campaign.name} — ${campaign.topic}
OBJECTIVE: ${campaign.objective}${campaign.icp ? `\nICP: ${campaign.icp}` : ""}

VERIFIED RESEARCH (the ONLY source of facts):
${bundle.campaignBase.markdown}

CANDIDATE PERSONAS (assign the best-fit one to each topic):
${roleList}

CHANNELS: ${channelLabels}${revision}${avoid}

Produce:
1. spine — the campaign's single core message (one sentence), grounded in research.
2. topics — AT LEAST ${PER_CHANNEL} DISTINCT options FOR EACH channel above (so
   ${PER_CHANNEL}× per channel). Every option: a different angle, a best-fit
   persona, and it must pass the 3 quality gates. Longform options are flagship
   (deep) pieces.

Return ONLY JSON (no prose, no code fences):
{"spine":"...","topics":[{"channel":"longform|blog|linkedin|instagram","personaId":"<id>","angle":"","headline":"","rationale":""}]}`;

  const raw = await callClaude({ system, user, maxTokens: 5000, webSearch: false });
  const parsed = safe(raw.match(/\{[\s\S]*\}/)?.[0] || "");
  const spine =
    (parsed?.spine && String(parsed.spine)) ||
    (await readTopicBank(slug))?.spine ||
    "(spine not generated)";

  const valid = new Set(planChannels);
  const seen = new Set(existing.map((t) => `${t.channel}|${norm(t.headline)}`));
  const fresh: Topic[] = [];
  for (const it of (parsed?.topics as Record<string, unknown>[]) || []) {
    const channel = String(it.channel || "").toLowerCase() as Channel;
    const headline = String(it.headline || "");
    if (!valid.has(channel) || !headline) continue;
    const key = `${channel}|${norm(headline)}`;
    if (seen.has(key)) continue; // dedupe against shelf + this batch
    seen.add(key);
    const personaId = String(it.personaId || "");
    fresh.push({
      id: newId(channel),
      channel,
      personaId,
      personaName: nameById.get(personaId) || personaId,
      angle: String(it.angle || ""),
      headline,
      rationale: String(it.rationale || ""),
      status: "available",
      generatedAt: new Date().toISOString(),
    });
  }

  const bank: TopicBank = {
    spine,
    topics: [...existing, ...fresh],
    updatedAt: new Date().toISOString(),
  };
  await writeBank(slug, bank);
  return bank;
}

export async function updateTopic(
  slug: string,
  id: string,
  patch: { angle?: string; headline?: string; personaId?: string },
): Promise<TopicBank> {
  const bank = await readTopicBank(slug);
  if (!bank) throw new Error("No topics.");
  const personas = await listPersonas();
  const nameById = new Map(personas.map((p) => [p.id, p.name]));
  bank.topics = bank.topics.map((t) =>
    t.id === id
      ? {
          ...t,
          angle: patch.angle ?? t.angle,
          headline: patch.headline ?? t.headline,
          personaId: patch.personaId ?? t.personaId,
          personaName: patch.personaId
            ? nameById.get(patch.personaId) || patch.personaId
            : t.personaName,
        }
      : t,
  );
  bank.updatedAt = new Date().toISOString();
  await writeBank(slug, bank);
  return bank;
}

export async function addCustomTopic(
  slug: string,
  input: { channel: Channel; headline: string; angle: string; personaId: string },
): Promise<TopicBank> {
  const bank = (await readTopicBank(slug)) || {
    spine: "",
    topics: [],
    updatedAt: new Date().toISOString(),
  };
  const personas = await listPersonas();
  const nameById = new Map(personas.map((p) => [p.id, p.name]));
  bank.topics.push({
    id: newId(input.channel),
    channel: input.channel,
    personaId: input.personaId,
    personaName: nameById.get(input.personaId) || input.personaId,
    angle: input.angle,
    headline: input.headline,
    rationale: "Added manually.",
    status: "available",
    generatedAt: new Date().toISOString(),
  });
  bank.updatedAt = new Date().toISOString();
  await writeBank(slug, bank);
  return bank;
}

export async function setTopicStatus(
  slug: string,
  ids: string[],
  status: TopicStatus,
): Promise<void> {
  const bank = await readTopicBank(slug);
  if (!bank) return;
  const set = new Set(ids);
  bank.topics = bank.topics.map((t) =>
    set.has(t.id) ? { ...t, status } : t,
  );
  await writeBank(slug, bank);
}

export async function getTopics(slug: string, ids: string[]): Promise<Topic[]> {
  const bank = await readTopicBank(slug);
  if (!bank) return [];
  const set = new Set(ids);
  return bank.topics.filter((t) => set.has(t.id));
}

async function writeBank(slug: string, bank: TopicBank): Promise<void> {
  await fs.mkdir(storylineDirPath(slug), { recursive: true });
  const byChannel = (c: Channel) => bank.topics.filter((t) => t.channel === c);
  const lines: string[] = [
    "---",
    campaignLink(slug),
    `updatedAt: ${bank.updatedAt}`,
    "---",
    "",
    "# Topic Bank",
    "",
    `**Spine:** ${bank.spine}`,
    "",
  ];
  for (const c of ["longform", "blog", "linkedin", "instagram"] as Channel[]) {
    const list = byChannel(c);
    if (!list.length) continue;
    lines.push(`## ${CHANNEL_LABELS[c]}`, "");
    for (const t of list) {
      lines.push(
        `- **${t.headline}** — ${t.personaName} · _${t.status}_`,
        `  - ${t.angle}`,
      );
    }
    lines.push("");
  }
  lines.push("## Data", "", "```json", JSON.stringify(bank, null, 2), "```", "");
  await fs.writeFile(topicBankPath(slug), lines.join("\n"), "utf8");
}

function safe(s: string): { spine?: unknown; topics?: unknown[] } | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
