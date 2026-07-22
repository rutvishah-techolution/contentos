import { promises as fs } from "fs";
import path from "path";
import { CAMPAIGNS_DIR } from "@/lib/brain";
import { Finding, Stream } from "@/lib/research/types";
import { SourcesIndex } from "@/lib/research/sources";

export interface RawPersonaResearch {
  personaId: string;
  personaName: string;
  stream: Stream;
  model: string;
  summary: string;
  findings: Finding[];
  error: string | null;
}

export interface BaseDoc {
  markdown: string; // body without frontmatter
  verified: number;
  flagged: number;
  stripped: number;
}

export interface ResearchBundle {
  hasResearch: boolean;
  hasSourceCheck: boolean;
  campaignBase: BaseDoc | null;
  scoutBase: BaseDoc | null;
  validationLog: string | null;
  sources: SourcesIndex | null;
  raw: RawPersonaResearch[];
}

async function readIfExists(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
}

function stripFrontmatter(md: string): { data: Record<string, string>; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: md };
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > -1) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: m[2].trim() };
}

function toBaseDoc(md: string | null): BaseDoc | null {
  if (!md) return null;
  const { data, body } = stripFrontmatter(md);
  return {
    markdown: body,
    verified: Number(data.verified || 0),
    flagged: Number(data.flagged || 0),
    stripped: Number(data.stripped || 0),
  };
}

export async function getResearchBundle(slug: string): Promise<ResearchBundle> {
  const dir = path.join(CAMPAIGNS_DIR, slug, "research");
  const rawDir = path.join(dir, "raw");
  const masterDir = path.join(dir, "master");

  const raw: RawPersonaResearch[] = [];
  try {
    const files = (await fs.readdir(rawDir)).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const md = await fs.readFile(path.join(rawDir, file), "utf8");
      const { data } = stripFrontmatter(md);
      const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
      let parsed: { summary?: string; findings?: Finding[]; error?: string | null } = {};
      if (block) {
        try {
          parsed = JSON.parse(block[1]);
        } catch {
          /* ignore */
        }
      }
      raw.push({
        personaId: data.personaId || file.replace(/\.md$/, ""),
        personaName: data.persona || file.replace(/\.md$/, ""),
        stream: (data.stream as Stream) || "campaign",
        model: data.model || "",
        summary: parsed.summary || "",
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
        error: parsed.error ?? (data.error || null),
      });
    }
  } catch {
    /* no raw dir yet */
  }

  // Find master bases by their frontmatter `stream` (name-agnostic).
  let campaignBase: BaseDoc | null = null;
  let scoutBase: BaseDoc | null = null;
  try {
    const files = (await fs.readdir(masterDir)).filter((f) =>
      f.endsWith(".md"),
    );
    for (const file of files) {
      const md = await fs.readFile(path.join(masterDir, file), "utf8");
      const { data } = stripFrontmatter(md);
      const doc = toBaseDoc(md);
      if (data.stream === "scout") scoutBase = doc;
      else campaignBase = doc;
    }
  } catch {
    /* no master dir yet */
  }

  // Top-level research/*.md files: the validation log and the sources index.
  let validationLog: string | null = null;
  let sources: SourcesIndex | null = null;
  try {
    const files = (await fs.readdir(dir, { withFileTypes: true }))
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name);
    const logFile = files.find((f) => /validation/i.test(f));
    if (logFile) validationLog = await readIfExists(path.join(dir, logFile));
    const srcFile = files.find((f) => /^sources/i.test(f));
    if (srcFile) {
      const md = (await readIfExists(path.join(dir, srcFile))) || "";
      const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
      if (block) {
        try {
          sources = JSON.parse(block[1]) as SourcesIndex;
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* none */
  }

  // sort raw: campaign first, then scout, stable by name
  raw.sort(
    (a, b) =>
      (a.stream === b.stream ? 0 : a.stream === "campaign" ? -1 : 1) ||
      a.personaName.localeCompare(b.personaName),
  );

  return {
    hasResearch: raw.length > 0,
    hasSourceCheck: !!(campaignBase || scoutBase),
    campaignBase,
    scoutBase,
    validationLog: validationLog ? stripFrontmatter(validationLog).body : null,
    sources,
    raw,
  };
}
