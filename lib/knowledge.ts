import { promises as fs } from "fs";
import path from "path";
import { BRAIN_DIR, slugify } from "@/lib/brain";
import { callClaude } from "@/lib/models/claude";

export const KNOWLEDGE_DIR = path.join(BRAIN_DIR, "knowledge");

export interface KnowledgeDoc {
  id: string;
  title: string;
  sourceName: string; // original filename
  type: string; // pdf | docx | txt | md
  uploadedAt: string;
  chars: number;
}

const SUPPORTED = ["pdf", "docx", "doc", "txt", "md", "markdown"];

function extOf(name: string): string {
  return (name.split(".").pop() || "").toLowerCase();
}

/** Pull plain text out of an uploaded file buffer. */
export async function extractText(
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const ext = extOf(filename);
  if (ext === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const res = await parser.getText();
      return (res.text || "").trim();
    } finally {
      await parser.destroy();
    }
  }
  if (ext === "docx" || ext === "doc") {
    const mammoth = (await import("mammoth")).default;
    const res = await mammoth.extractRawText({ buffer });
    return (res.value || "").trim();
  }
  // txt / md / markdown / anything text-like
  return buffer.toString("utf8").trim();
}

function parseFm(md: string): { data: Record<string, string>; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: md };
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > -1) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: m[2].trim() };
}

/** Store an uploaded document as extracted text in the Brain. */
export async function saveKnowledgeDoc(
  filename: string,
  buffer: Buffer,
): Promise<KnowledgeDoc> {
  const ext = extOf(filename);
  if (!SUPPORTED.includes(ext))
    throw new Error(`Unsupported file type: .${ext}. Use PDF, DOCX, TXT, or MD.`);

  const text = await extractText(filename, buffer);
  if (!text || text.length < 20)
    throw new Error("Couldn't extract readable text from that file.");

  await fs.mkdir(KNOWLEDGE_DIR, { recursive: true });
  const title = filename.replace(/\.[^.]+$/, "");
  const base = slugify(title);
  let id = base;
  let n = 2;
  while (
    await fs
      .access(path.join(KNOWLEDGE_DIR, `${id}.md`))
      .then(() => true)
      .catch(() => false)
  ) {
    id = `${base}-${n++}`;
  }

  const uploadedAt = new Date().toISOString();
  const md = [
    "---",
    `id: ${id}`,
    `title: ${title}`,
    `sourceName: ${filename}`,
    `type: ${ext}`,
    `uploadedAt: ${uploadedAt}`,
    `chars: ${text.length}`,
    "---",
    "",
    `# ${title}`,
    "",
    text,
    "",
  ].join("\n");
  await fs.writeFile(path.join(KNOWLEDGE_DIR, `${id}.md`), md, "utf8");

  return { id, title, sourceName: filename, type: ext, uploadedAt, chars: text.length };
}

export async function listKnowledge(): Promise<KnowledgeDoc[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(KNOWLEDGE_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const docs: KnowledgeDoc[] = [];
  for (const f of files) {
    const md = await fs.readFile(path.join(KNOWLEDGE_DIR, f), "utf8");
    const { data } = parseFm(md);
    docs.push({
      id: data.id || f.replace(/\.md$/, ""),
      title: data.title || f.replace(/\.md$/, ""),
      sourceName: data.sourceName || "",
      type: data.type || "",
      uploadedAt: data.uploadedAt || "",
      chars: Number(data.chars || 0),
    });
  }
  return docs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function deleteKnowledge(id: string): Promise<void> {
  try {
    await fs.unlink(path.join(KNOWLEDGE_DIR, `${path.basename(id)}.md`));
  } catch {
    /* already gone */
  }
}

/** Concatenated company knowledge for grounding (bounded). */
export async function getKnowledgeContext(maxChars = 12000): Promise<string> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(KNOWLEDGE_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return "";
  }
  const parts: string[] = [];
  let total = 0;
  for (const f of files) {
    if (total >= maxChars) break;
    const md = await fs.readFile(path.join(KNOWLEDGE_DIR, f), "utf8");
    const { data, body } = parseFm(md);
    const slice = body.slice(0, maxChars - total);
    parts.push(`### ${data.title || f}\n${slice}`);
    total += slice.length;
  }
  return parts.join("\n\n");
}

export interface ExtractedBrief {
  name: string;
  topic: string;
  objective: string;
  icp: string;
  constraints: string;
}

/** Read an uploaded brief doc and pull campaign fields out of it via Claude. */
export async function extractBriefFromDoc(
  filename: string,
  buffer: Buffer,
): Promise<ExtractedBrief> {
  const text = await extractText(filename, buffer);
  if (!text || text.length < 20)
    throw new Error("Couldn't extract readable text from that file.");

  const system = `You extract a B2B content-campaign brief from a document. Return ONLY valid JSON with these keys:
{"name": "...", "topic": "...", "objective": "...", "icp": "...", "constraints": "..."}
- name: a short campaign name (<= 8 words). Infer one if not explicit.
- topic: what to research/write about.
- objective: what the content should achieve.
- icp: the target audience (roles, seniority, company profile).
- constraints: must-haves or things to avoid. Empty string if none.
Use ONLY what the document supports; leave a field "" if the document says nothing about it. Do not invent facts.`;
  const raw = await callClaude({
    system,
    user: `DOCUMENT:\n${text.slice(0, 20000)}`,
    maxTokens: 1200,
    webSearch: false,
  });
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Couldn't read a brief from that document.");
  const j = JSON.parse(m[0]);
  return {
    name: (j.name || "").trim(),
    topic: (j.topic || "").trim(),
    objective: (j.objective || "").trim(),
    icp: (j.icp || "").trim(),
    constraints: (j.constraints || "").trim(),
  };
}
