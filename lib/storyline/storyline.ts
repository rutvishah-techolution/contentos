import { promises as fs } from "fs";
import path from "path";
import {
  WRITING_DIR,
  getCampaign,
  listPersonas,
  storylineDirPath,
  campaignLink,
  setCampaignStatus,
  readPersonaBody,
} from "@/lib/brain";
import { getResearchBundle } from "@/lib/research/read";
import { callClaude } from "@/lib/models/claude";
import { readPlan } from "@/lib/storyline/plan";
import {
  Channel,
  CHANNEL_LABELS,
  ChatMsg,
  Storyline,
  StorylineDoc,
} from "@/lib/storyline/types";

async function readWriting(file: string): Promise<string> {
  try {
    return await fs.readFile(path.join(WRITING_DIR, file), "utf8");
  } catch {
    return "";
  }
}

function piecePath(slug: string, channel: Channel): string {
  return path.join(storylineDirPath(slug), `${channel}.md`);
}

const GROUNDING = `════════ ANTI-HALLUCINATION — ABSOLUTE ════════
Use ONLY facts, figures, companies, and claims present in the VERIFIED RESEARCH
below. Never invent or add a statistic or claim that isn't in it. Every number in
the storyline must trace to the research. You have NO web access — the research is
your only source of facts.`;

const LAYERING = `STRUCTURE (the storyline shape) governs the SHAPE of the piece.
PERSONA governs the VOICE. Where the persona's habits conflict with the required
structure, keep the structure and express the persona through voice — not by
changing the shape.`;

/** Generates a storyline for every approved plan item. */
export async function generateStorylines(slug: string): Promise<StorylineDoc[]> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);
  const plan = await readPlan(slug);
  if (!plan || !plan.approved) throw new Error("Approve a content plan first.");
  const bundle = await getResearchBundle(slug);
  const research = bundle.campaignBase?.markdown || "";
  if (!research) throw new Error("No approved research base.");

  const [structure, craft, brand, psych] = await Promise.all([
    readWriting("storyline-structure.md"),
    readWriting("craft-rules.md"),
    readWriting("brand-context.md"),
    readWriting("reader-psychology.md"),
  ]);
  const personas = await listPersonas();
  const pathById = new Map(personas.map((p) => [p.id, p.path]));

  const docs = await Promise.all(
    plan.items.map(async (item) => {
      const pPath = pathById.get(item.personaId);
      const voice = pPath ? await readPersonaBody(pPath) : "";

      const system = `You write B2B campaign content as a specific persona.

${GROUNDING}

════════ STORYLINE STRUCTURE ════════
${structure}

════════ CRAFT RULES ════════
${craft}

════════ READER PSYCHOLOGY ════════
${psych}

════════ BRAND ════════
${brand}

════════ YOUR VOICE (the persona you write as) ════════
${voice}

${LAYERING}`;

      const user = `CAMPAIGN: ${campaign.name} — ${campaign.topic}
OBJECTIVE: ${campaign.objective}${campaign.icp ? `\nICP: ${campaign.icp}` : ""}
SPINE (shared campaign message): ${plan.spine}

THIS PIECE:
- Channel: ${CHANNEL_LABELS[item.channel]}
- Angle: ${item.angle}
- Working headline: ${item.headline}
- Content type: Type 1 (service-focused — the service is the hero, introduced after the villain)

VERIFIED RESEARCH (your ONLY source of facts):
${research}

Produce the storyline for THIS piece — the narrative skeleton, not the full copy.
Return ONLY JSON (no prose, no code fences):
{"headline":"","hook":"","villain":"","shift":"","hero":"","proof":"","learning":"","cta":""}`;

      const raw = await callClaude({
        system,
        user,
        maxTokens: 2000,
        webSearch: false,
      });
      const storyline = parseStoryline(raw, item.headline);
      const doc: StorylineDoc = {
        channel: item.channel,
        personaId: item.personaId,
        personaName: item.personaName,
        angle: item.angle,
        storyline,
        chat: [],
        approved: false,
        generatedAt: new Date().toISOString(),
      };
      await writeDoc(slug, doc);
      return doc;
    }),
  );

  return docs;
}

/** Chat-with-memory revision: the model sees the full thread + current storyline. */
export async function reviseStoryline(
  slug: string,
  channel: Channel,
  message: string,
): Promise<StorylineDoc> {
  const doc = await readDoc(slug, channel);
  if (!doc) throw new Error("Storyline not found.");
  const campaign = await getCampaign(slug);
  const bundle = await getResearchBundle(slug);
  const research = bundle.campaignBase?.markdown || "";

  const personas = await listPersonas();
  const pPath = personas.find((p) => p.id === doc.personaId)?.path;
  const voice = pPath ? await readPersonaBody(pPath) : "";
  const [structure, craft, brand] = await Promise.all([
    readWriting("storyline-structure.md"),
    readWriting("craft-rules.md"),
    readWriting("brand-context.md"),
  ]);

  const system = `You are revising an existing storyline with the reviewer, in a conversation. Apply their guidance while keeping the storyline grounded in the research and true to the persona's voice and the required structure.

${GROUNDING}

════════ STORYLINE STRUCTURE ════════
${structure}

════════ CRAFT RULES ════════
${craft}

════════ BRAND ════════
${brand}

════════ YOUR VOICE ════════
${voice}

${LAYERING}

Return ONLY JSON: {"storyline":{"headline":"","hook":"","villain":"","shift":"","hero":"","proof":"","learning":"","cta":""},"reply":"one sentence on what you changed"}`;

  const history = doc.chat
    .map((m) => `${m.role === "user" ? "REVIEWER" : "YOU"}: ${m.content}`)
    .join("\n");

  const user = `CAMPAIGN: ${campaign?.name} — ${campaign?.topic}

VERIFIED RESEARCH (your ONLY source of facts):
${research}

CURRENT STORYLINE:
${JSON.stringify(doc.storyline, null, 2)}

CONVERSATION SO FAR:
${history || "(none yet)"}

NEW MESSAGE FROM REVIEWER:
"${message}"

Revise the storyline accordingly and reply.`;

  const raw = await callClaude({ system, user, maxTokens: 2200, webSearch: false });
  const { storyline, reply } = parseRevision(raw, doc.storyline);

  doc.storyline = storyline;
  doc.chat.push({ role: "user", content: message });
  doc.chat.push({ role: "assistant", content: reply });
  doc.approved = false; // a revision un-approves until re-approved
  await writeDoc(slug, doc);
  return doc;
}

export async function approveStoryline(
  slug: string,
  channel: Channel,
): Promise<{ allApproved: boolean }> {
  const doc = await readDoc(slug, channel);
  if (!doc) throw new Error("Storyline not found.");
  doc.approved = true;
  await writeDoc(slug, doc);

  const all = await readStorylines(slug);
  const allApproved = all.length > 0 && all.every((d) => d.approved);
  if (allApproved) await setCampaignStatus(slug, "ready-for-draft");
  return { allApproved };
}

export async function readStorylines(slug: string): Promise<StorylineDoc[]> {
  const dir = storylineDirPath(slug);
  const order: Channel[] = ["blog", "linkedin", "instagram"];
  const docs: StorylineDoc[] = [];
  for (const c of order) {
    const d = await readDoc(slug, c);
    if (d) docs.push(d);
  }
  return docs;
}

// ── parse + persist ──────────────────────────────────────────────────────────
function parseStoryline(raw: string, fallbackHeadline: string): Storyline {
  const m = raw.match(/\{[\s\S]*\}/);
  const j = m ? safe(m[0]) : null;
  const s = (j || {}) as Partial<Storyline>;
  return {
    headline: str(s.headline) || fallbackHeadline,
    hook: str(s.hook),
    villain: str(s.villain),
    shift: str(s.shift),
    hero: str(s.hero),
    proof: str(s.proof),
    learning: str(s.learning),
    cta: str(s.cta),
  };
}

function parseRevision(
  raw: string,
  prev: Storyline,
): { storyline: Storyline; reply: string } {
  const m = raw.match(/\{[\s\S]*\}/);
  const j = m ? safe(m[0]) : null;
  const obj = (j || {}) as { storyline?: Partial<Storyline>; reply?: unknown };
  const s = obj.storyline || {};
  return {
    storyline: {
      headline: str(s.headline) || prev.headline,
      hook: str(s.hook) || prev.hook,
      villain: str(s.villain) || prev.villain,
      shift: str(s.shift) || prev.shift,
      hero: str(s.hero) || prev.hero,
      proof: str(s.proof) || prev.proof,
      learning: str(s.learning) || prev.learning,
      cta: str(s.cta) || prev.cta,
    },
    reply: str(obj.reply) || "Updated.",
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function safe(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function writeDoc(slug: string, doc: StorylineDoc): Promise<void> {
  await fs.mkdir(storylineDirPath(slug), { recursive: true });
  const s = doc.storyline;
  const lines = [
    "---",
    campaignLink(slug),
    `channel: ${doc.channel}`,
    `persona: ${doc.personaName}`,
    `approved: ${doc.approved}`,
    "---",
    "",
    `# ${CHANNEL_LABELS[doc.channel]} Storyline — ${s.headline}`,
    "",
    `**Author:** ${doc.personaName}  ·  **Angle:** ${doc.angle}`,
    "",
    `**Hook:** ${s.hook}`,
    `**Villain:** ${s.villain}`,
    `**Shift:** ${s.shift}`,
    `**Hero:** ${s.hero}`,
    `**Proof:** ${s.proof}`,
    `**Learning:** ${s.learning}`,
    `**CTA:** ${s.cta}`,
    "",
    "## Data",
    "",
    "```json",
    JSON.stringify(doc, null, 2),
    "```",
    "",
  ];
  await fs.writeFile(piecePath(slug, doc.channel), lines.join("\n"), "utf8");
}

async function readDoc(
  slug: string,
  channel: Channel,
): Promise<StorylineDoc | null> {
  try {
    const md = await fs.readFile(piecePath(slug, channel), "utf8");
    const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
    return block ? (JSON.parse(block[1]) as StorylineDoc) : null;
  } catch {
    return null;
  }
}
