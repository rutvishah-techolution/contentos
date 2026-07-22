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
import { callClaude } from "@/lib/models/claude";
import { readStorylines } from "@/lib/storyline/storyline";
import { extractFigures } from "@/lib/research/verify";
import { Channel, CHANNEL_LABELS, ChatMsg, StorylineDoc } from "@/lib/storyline/types";

export interface FactTrace {
  total: number;
  traced: number;
  untraced: string[];
}

export interface DraftDoc {
  id: string; // piece id (= storyline/topic id)
  channel: Channel;
  personaId: string;
  personaName: string;
  copy: string;
  factTrace: FactTrace;
  chat: ChatMsg[];
  approved: boolean;
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
RESEARCH provided. Never invent a statistic or claim not in it. Every number must
trace to the research. You have NO web access.`;

/** 3-pass drafting pipeline for every approved storyline. */
export async function generateDrafts(slug: string): Promise<DraftDoc[]> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);
  const storylines = (await readStorylines(slug)).filter((s) => s.approved);
  if (storylines.length === 0) throw new Error("Approve at least one storyline first.");
  const research = (await getResearchBundle(slug)).campaignBase?.markdown || "";

  const [structure, formats, craft, psych, brand, humanizer] = await Promise.all([
    readWriting("storyline-structure.md"),
    readWriting("format-rules.md"),
    readWriting("craft-rules.md"),
    readWriting("reader-psychology.md"),
    readWriting("brand-context.md"),
    readWriting("humanizer.md"),
  ]);
  const personas = await listPersonas();
  const pathById = new Map(personas.map((p) => [p.id, p.path]));

  const docs = await Promise.all(
    storylines.map(async (sl) => {
      const voice = pathById.get(sl.personaId)
        ? await readPersonaBody(pathById.get(sl.personaId) as string)
        : "";
      const copy = await runPipeline({
        campaign: { name: campaign.name, topic: campaign.topic },
        storyline: sl,
        research,
        voice,
        frameworks: { structure, formats, craft, psych, brand, humanizer },
      });
      const doc: DraftDoc = {
        id: sl.id,
        channel: sl.channel,
        personaId: sl.personaId,
        personaName: sl.personaName,
        copy,
        factTrace: traceFacts(copy, `${research}\n\n${brand}`),
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

interface PipelineArgs {
  campaign: { name: string; topic: string };
  storyline: StorylineDoc;
  research: string;
  voice: string;
  frameworks: Record<string, string>;
}

async function runPipeline(a: PipelineArgs): Promise<string> {
  const chan = CHANNEL_LABELS[a.storyline.channel];
  const s = a.storyline.storyline;
  const storylineText = `Headline: ${s.headline}
Hook: ${s.hook}
Villain: ${s.villain}
Shift: ${s.shift}
Hero: ${s.hero}
Proof: ${s.proof}
Learning: ${s.learning}
CTA: ${s.cta}`;

  const write1System = `You write B2B campaign content as a specific persona.

${GROUNDING}

STORYLINE STRUCTURE:
${a.frameworks.structure}

CHANNEL FORMAT RULES (follow the rules for ${chan}):
${a.frameworks.formats}

BRAND:
${a.frameworks.brand}

YOUR VOICE (write as this persona):
${a.voice}

STRUCTURE governs shape; PERSONA governs voice. On conflict, keep structure.`;
  const write1User = `CAMPAIGN: ${a.campaign.name} — ${a.campaign.topic}

APPROVED STORYLINE (follow it):
${storylineText}

VERIFIED RESEARCH (your only source of facts):
${a.research}

Write the full ${chan} piece, following the ${chan} format rules exactly.
Output ONLY the piece as clean Markdown — no preamble, no notes.`;
  const d1 = await callClaude({ system: write1System, user: write1User, maxTokens: 3000, webSearch: false });

  const editSystem = `You are a sharp editor. Tighten this draft to enforce these rules, WITHOUT adding new facts and WITHOUT losing the persona's voice:

${a.frameworks.craft}

${a.frameworks.psych}

Keep the same voice. Output ONLY the edited piece as Markdown.`;
  const d2 = await callClaude({
    system: editSystem,
    user: `RESEARCH (facts must stay grounded here):\n${a.research}\n\nDRAFT:\n${d1}`,
    maxTokens: 3000,
    webSearch: false,
  });

  const humanSystem = `${a.frameworks.humanizer}\n\nEdit only. Do not add new facts. Keep the persona's voice. Output ONLY the final piece as Markdown.`;
  const d3 = await callClaude({
    system: humanSystem,
    user: `FINAL PASS on this ${chan} piece:\n\n${d2}`,
    maxTokens: 3000,
    webSearch: false,
  });
  return d3.trim();
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

/** Chat-with-memory revision of a draft's copy. */
export async function reviseDraft(
  slug: string,
  id: string,
  message: string,
): Promise<DraftDoc> {
  const doc = await readDraft(slug, id);
  if (!doc) throw new Error("Draft not found.");
  const research = (await getResearchBundle(slug)).campaignBase?.markdown || "";
  const personas = await listPersonas();
  const pPath = personas.find((p) => p.id === doc.personaId)?.path;
  const voice = pPath ? await readPersonaBody(pPath) : "";
  const [craft, brand] = await Promise.all([
    readWriting("craft-rules.md"),
    readWriting("brand-context.md"),
  ]);

  const system = `You are revising a finished ${CHANNEL_LABELS[doc.channel]} piece with the reviewer, in a conversation. Apply their guidance while keeping it grounded, in voice, and clean.

${GROUNDING}

CRAFT:
${craft}

BRAND:
${brand}

VOICE:
${voice}

Return the FULL revised piece as Markdown, then a new line "---REPLY---", then one sentence on what you changed.`;

  const history = doc.chat
    .map((m) => `${m.role === "user" ? "REVIEWER" : "YOU"}: ${m.content}`)
    .join("\n");
  const user = `RESEARCH (facts must stay grounded here):
${research}

CURRENT PIECE:
${doc.copy}

CONVERSATION SO FAR:
${history || "(none yet)"}

NEW MESSAGE:
"${message}"`;

  const raw = await callClaude({ system, user, maxTokens: 3200, webSearch: false });
  const [copyPart, replyPart] = raw.split(/---REPLY---/);
  const copy = (copyPart || raw).trim();
  const reply = (replyPart || "Updated.").trim();

  doc.copy = copy;
  doc.factTrace = traceFacts(copy, `${research}\n\n${brand}`);
  doc.chat.push({ role: "user", content: message });
  doc.chat.push({ role: "assistant", content: reply.slice(0, 200) });
  doc.approved = false;
  await writeDraft(slug, doc);
  return doc;
}

export async function approveDraft(
  slug: string,
  id: string,
): Promise<{ allApproved: boolean }> {
  const doc = await readDraft(slug, id);
  if (!doc) throw new Error("Draft not found.");
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
  const rank: Record<string, number> = { longform: 0, blog: 1, linkedin: 2, instagram: 3 };
  return docs.sort((a, b) => (rank[a.channel] ?? 9) - (rank[b.channel] ?? 9));
}

async function writeDraft(slug: string, doc: DraftDoc): Promise<void> {
  await fs.mkdir(draftsDirPath(slug), { recursive: true });
  const md = [
    "---",
    campaignLink(slug),
    `pieceId: ${doc.id}`,
    `channel: ${doc.channel}`,
    `persona: ${doc.personaName}`,
    `approved: ${doc.approved}`,
    `factTrace: ${doc.factTrace.traced}/${doc.factTrace.total} traced`,
    "---",
    "",
    `# ${CHANNEL_LABELS[doc.channel]} — Final Copy`,
    "",
    doc.copy,
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
