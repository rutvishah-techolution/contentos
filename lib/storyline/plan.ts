import { promises as fs } from "fs";
import path from "path";
import {
  WRITING_DIR,
  getCampaign,
  listPersonas,
  planPath,
  storylineDirPath,
  campaignLink,
  setCampaignStatus,
  readPersonaBody,
} from "@/lib/brain";
import { getResearchBundle } from "@/lib/research/read";
import { callClaude } from "@/lib/models/claude";
import {
  Channel,
  CHANNEL_LABELS,
  ContentPlan,
  PlanItem,
} from "@/lib/storyline/types";

async function readWriting(file: string): Promise<string> {
  try {
    return await fs.readFile(path.join(WRITING_DIR, file), "utf8");
  } catch {
    return "";
  }
}

/** First substantive paragraph of a persona file — a short "who they are". */
function personaEssence(body: string): string {
  const paras = body
    .split(/\n{2,}/)
    .map((p) => p.replace(/^#+.*$/gm, "").replace(/^>/gm, "").trim())
    .filter((p) => p.length > 60 && !p.startsWith("---"));
  return (paras[0] || "").slice(0, 320);
}

/**
 * Generates the campaign content plan: one shared spine + one distinct,
 * persona-owned angle per selected channel. Grounded STRICTLY in the approved
 * research — no web search, no invented facts.
 */
export async function generatePlan(
  slug: string,
  channels: Channel[],
  feedback = "",
): Promise<ContentPlan> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);

  const bundle = await getResearchBundle(slug);
  if (!bundle.campaignBase) {
    throw new Error("No approved research base yet — run + approve research first.");
  }
  if (channels.length === 0) throw new Error("Pick at least one channel.");

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

  const system = `You are a B2B content strategist planning a campaign's content pieces.

════════ ANTI-HALLUCINATION — ABSOLUTE ════════
Ground EVERYTHING strictly in the VERIFIED RESEARCH provided below. Do NOT
invent, add, or assume any statistic, company, event, or claim that is not
present in that research. Angles must be supportable by the research you are
given. If the research doesn't support an angle, don't propose it.

════════ HOW TO PLAN ════════
${structure}

${angles}

════════ BRAND ════════
${brand}`;

  const roleList = roster
    .map((r) => `- id:"${r.id}" | ${r.name} — ${r.essence}`)
    .join("\n");

  const channelList = channels.map((c) => CHANNEL_LABELS[c]).join(", ");

  const revision = feedback
    ? `\n\nREVISION NOTE FROM THE HUMAN REVIEWER — address this in the new plan:\n"${feedback}"\n`
    : "";

  const user = `CAMPAIGN
Name: ${campaign.name}
Topic: ${campaign.topic}
Objective: ${campaign.objective}${campaign.icp ? `\nICP: ${campaign.icp}` : ""}

VERIFIED RESEARCH (the ONLY source of facts — ground everything here):
${bundle.campaignBase.markdown}

CANDIDATE PERSONAS (writers — assign the best-fit one to each piece):
${roleList}

CHANNELS TO PLAN (one distinct piece each): ${channelList}${revision}

Produce:
1. spine — the campaign's single core message (one sentence), grounded in the research.
2. items — ONE piece per channel above. Each is a DISTINCT angle (no two alike),
   assigned to the best-fit persona, and must pass the 3 quality gates.

Return ONLY JSON (no prose, no code fences):
{"spine":"...","items":[{"channel":"blog|linkedin|instagram","personaId":"<id>","angle":"the distinct angle","headline":"working headline","rationale":"why this angle + persona + channel"}]}`;

  const raw = await callClaude({ system, user, maxTokens: 3000, webSearch: false });
  const plan = parsePlan(raw, channels, roster);
  await writePlan(slug, plan);
  await setCampaignStatus(slug, "planning");
  return plan;
}

function parsePlan(
  raw: string,
  channels: Channel[],
  roster: { id: string; name: string }[],
): ContentPlan {
  const m = raw.match(/\{[\s\S]*\}/);
  const parsed = m ? safeJson(m[0]) : null;
  const nameById = new Map(roster.map((r) => [r.id, r.name]));
  const validChannel = new Set(channels);

  const spine =
    (parsed?.spine && String(parsed.spine)) || "(spine not generated)";
  const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
  const items: PlanItem[] = rawItems
    .map((it: Record<string, unknown>) => {
      const channel = String(it.channel || "").toLowerCase() as Channel;
      const personaId = String(it.personaId || "");
      return {
        channel,
        personaId,
        personaName: nameById.get(personaId) || personaId,
        angle: String(it.angle || ""),
        headline: String(it.headline || ""),
        rationale: String(it.rationale || ""),
      };
    })
    .filter((it: PlanItem) => validChannel.has(it.channel) && it.angle);

  return {
    spine,
    items,
    generatedAt: new Date().toISOString(),
    approved: false,
  };
}

function safeJson(s: string): { spine?: unknown; items?: unknown[] } | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function writePlan(slug: string, plan: ContentPlan): Promise<void> {
  await fs.mkdir(storylineDirPath(slug), { recursive: true });
  const lines: string[] = [
    "---",
    campaignLink(slug),
    `approved: ${plan.approved}`,
    `generatedAt: ${plan.generatedAt}`,
    "---",
    "",
    "# Content Plan",
    "",
    `**Spine:** ${plan.spine}`,
    "",
  ];
  for (const it of plan.items) {
    lines.push(
      `## ${CHANNEL_LABELS[it.channel]} — ${it.headline}`,
      "",
      `- **Angle:** ${it.angle}`,
      `- **Author:** ${it.personaName}`,
      `- **Why:** ${it.rationale}`,
      "",
    );
  }
  lines.push("## Data", "", "```json", JSON.stringify(plan, null, 2), "```", "");
  await fs.writeFile(planPath(slug), lines.join("\n"), "utf8");
}

export async function readPlan(slug: string): Promise<ContentPlan | null> {
  try {
    const md = await fs.readFile(planPath(slug), "utf8");
    const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
    if (!block) return null;
    return JSON.parse(block[1]) as ContentPlan;
  } catch {
    return null;
  }
}

export async function approvePlan(slug: string): Promise<void> {
  const plan = await readPlan(slug);
  if (!plan) throw new Error("No plan to approve.");
  plan.approved = true;
  await writePlan(slug, plan);
  await setCampaignStatus(slug, "storyline");
}
