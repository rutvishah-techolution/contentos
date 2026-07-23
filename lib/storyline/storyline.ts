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
import { getKnowledgeContext } from "@/lib/knowledge";
import { callClaude } from "@/lib/models/claude";
import { getTopics, setTopicStatus } from "@/lib/storyline/topics";
import {
  CHANNEL_LABELS,
  CHANNEL_ORDER,
  PieceKind,
  Storyline,
  StorylineDoc,
} from "@/lib/storyline/types";

/** How the storyline should treat the service, per kind. */
function intentGuidance(kind: PieceKind): string {
  return kind === "thought-leadership"
    ? `CONTENT TYPE: Thought leadership (informative). The HERO is the insight or
approach — NOT the service. Do not make the service the hero and do not pitch.
The CTA must be a smooth, SUBTLE one-line mention of the service ("the kind of
problem we work on…"), never a hard sell.`
    : `CONTENT TYPE: Campaign (Type 1, service-focused). The service is the hero,
introduced after the villain. The CTA is a soft, direct call to the service.`;
}

async function readWriting(file: string): Promise<string> {
  try {
    return await fs.readFile(path.join(WRITING_DIR, file), "utf8");
  } catch {
    return "";
  }
}

// piece files are prefixed so they don't collide with plan.md / topic-bank.md
function piecePath(slug: string, id: string): string {
  return path.join(storylineDirPath(slug), `piece-${id}.md`);
}

const GROUNDING = `════════ ANTI-HALLUCINATION — ABSOLUTE ════════
Use ONLY facts, figures, companies, and claims present in the VERIFIED RESEARCH
below. Never invent a statistic or claim that isn't in it. Every number must
trace to the research. You have NO web access.`;

const LAYERING = `STRUCTURE governs the SHAPE of the piece. PERSONA governs the
VOICE. On conflict, keep the structure and express the persona through voice.`;

/** Generates a storyline for each SELECTED topic id, and marks them in-production. */
export async function generateStorylines(
  slug: string,
  topicIds: string[],
): Promise<StorylineDoc[]> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);
  const topics = await getTopics(slug, topicIds);
  if (topics.length === 0) throw new Error("Select at least one topic.");
  const bundle = await getResearchBundle(slug);
  const campaignMd = bundle.campaignBase?.markdown || "";
  const scoutMd = bundle.scoutBase?.markdown || "";
  if (!campaignMd) throw new Error("No approved research base.");
  const spine = ""; // spine is in the topic bank; not needed per-piece here

  const [structure, craft, brand, psych, knowledge] = await Promise.all([
    readWriting("storyline-structure.md"),
    readWriting("craft-rules.md"),
    readWriting("brand-context.md"),
    readWriting("reader-psychology.md"),
    getKnowledgeContext(6000),
  ]);
  // thought-leadership pieces may draw on the broader scout research + knowledge
  const researchFor = (kind: PieceKind) =>
    kind === "thought-leadership"
      ? [campaignMd, scoutMd, knowledge].filter(Boolean).join("\n\n──────\n\n")
      : campaignMd;
  const personas = await listPersonas();
  const pathById = new Map(personas.map((p) => [p.id, p.path]));

  const docs = await Promise.all(
    topics.map(async (t) => {
      const voice = pathById.get(t.personaId)
        ? await readPersonaBody(pathById.get(t.personaId) as string)
        : "";
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

════════ YOUR VOICE ════════
${voice}

${LAYERING}`;
      const user = `CAMPAIGN: ${campaign.name} — ${campaign.topic}
OBJECTIVE: ${campaign.objective}${campaign.icp ? `\nICP: ${campaign.icp}` : ""}${spine}

THIS PIECE:
- Channel: ${CHANNEL_LABELS[t.channel]}
- Angle: ${t.angle}
- Working headline: ${t.headline}
${intentGuidance(t.kind)}

VERIFIED RESEARCH (your ONLY source of facts):
${researchFor(t.kind)}

Produce the storyline for THIS piece — the narrative skeleton, not full copy.
Return ONLY JSON (no prose, no code fences):
{"headline":"","hook":"","villain":"","shift":"","hero":"","proof":"","learning":"","cta":""}`;

      const raw = await callClaude({ system, user, maxTokens: 2000, webSearch: false });
      const storyline = parseStoryline(raw, t.headline);
      const doc: StorylineDoc = {
        id: t.id,
        channel: t.channel,
        kind: t.kind,
        personaId: t.personaId,
        personaName: t.personaName,
        angle: t.angle,
        headline: storyline.headline,
        storyline,
        chat: [],
        approved: false,
        generatedAt: new Date().toISOString(),
      };
      await writeDoc(slug, doc);
      return doc;
    }),
  );

  await setTopicStatus(slug, topicIds, "in-production");
  await setCampaignStatus(slug, "storyline");
  return docs;
}

/** Chat-with-memory revision. */
export async function reviseStoryline(
  slug: string,
  id: string,
  message: string,
): Promise<StorylineDoc> {
  const doc = await readDoc(slug, id);
  if (!doc) throw new Error("Storyline not found.");
  const campaign = await getCampaign(slug);
  const research = (await getResearchBundle(slug)).campaignBase?.markdown || "";
  const personas = await listPersonas();
  const pPath = personas.find((p) => p.id === doc.personaId)?.path;
  const voice = pPath ? await readPersonaBody(pPath) : "";
  const [structure, craft, brand] = await Promise.all([
    readWriting("storyline-structure.md"),
    readWriting("craft-rules.md"),
    readWriting("brand-context.md"),
  ]);

  const system = `You are revising an existing storyline with the reviewer, in a conversation. Apply their guidance while keeping it grounded, in voice, and true to the structure.

${GROUNDING}

STORYLINE STRUCTURE:
${structure}

CRAFT:
${craft}

BRAND:
${brand}

YOUR VOICE:
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

Revise accordingly and reply.`;

  const raw = await callClaude({ system, user, maxTokens: 2200, webSearch: false });
  const { storyline, reply } = parseRevision(raw, doc.storyline);
  doc.storyline = storyline;
  doc.headline = storyline.headline;
  doc.chat.push({ role: "user", content: message });
  doc.chat.push({ role: "assistant", content: reply });
  doc.approved = false;
  await writeDoc(slug, doc);
  return doc;
}

/** Manual edit — the user overrides storyline fields directly. */
export async function editStoryline(
  slug: string,
  id: string,
  patch: Partial<Storyline>,
): Promise<StorylineDoc> {
  const doc = await readDoc(slug, id);
  if (!doc) throw new Error("Storyline not found.");
  doc.storyline = { ...doc.storyline, ...patch };
  doc.headline = doc.storyline.headline;
  doc.approved = false;
  await writeDoc(slug, doc);
  return doc;
}

export async function approveStoryline(
  slug: string,
  id: string,
  approved = true,
): Promise<{ allApproved: boolean }> {
  const doc = await readDoc(slug, id);
  if (!doc) throw new Error("Storyline not found.");
  doc.approved = approved;
  await writeDoc(slug, doc);
  const all = await readStorylines(slug);
  const allApproved = all.length > 0 && all.every((d) => d.approved);
  // reflect state both ways (undo an approval should walk the status back)
  await setCampaignStatus(slug, allApproved ? "ready-for-draft" : "storyline");
  return { allApproved };
}

export async function readStorylines(slug: string): Promise<StorylineDoc[]> {
  const dir = storylineDirPath(slug);
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter(
      (f) => f.startsWith("piece-") && f.endsWith(".md"),
    );
  } catch {
    return [];
  }
  const docs: StorylineDoc[] = [];
  for (const f of files) {
    const id = f.replace(/^piece-/, "").replace(/\.md$/, "");
    const d = await readDoc(slug, id);
    if (d) docs.push(d);
  }
  return docs.sort(
    (a, b) =>
      (CHANNEL_ORDER.indexOf(a.channel) + 1 || 9) -
      (CHANNEL_ORDER.indexOf(b.channel) + 1 || 9),
  );
}

// ── parse + persist ──────────────────────────────────────────────────────────
function parseStoryline(raw: string, fallbackHeadline: string): Storyline {
  const j = safe(raw.match(/\{[\s\S]*\}/)?.[0] || "") as Partial<Storyline> | null;
  const s = j || {};
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
  const obj = (safe(raw.match(/\{[\s\S]*\}/)?.[0] || "") || {}) as {
    storyline?: Partial<Storyline>;
    reply?: unknown;
  };
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
  const md = [
    "---",
    campaignLink(slug),
    `pieceId: ${doc.id}`,
    `channel: ${doc.channel}`,
    `kind: ${doc.kind}`,
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
  ].join("\n");
  await fs.writeFile(piecePath(slug, doc.id), md, "utf8");
}

async function readDoc(slug: string, id: string): Promise<StorylineDoc | null> {
  try {
    const md = await fs.readFile(piecePath(slug, id), "utf8");
    const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
    return block ? (JSON.parse(block[1]) as StorylineDoc) : null;
  } catch {
    return null;
  }
}
