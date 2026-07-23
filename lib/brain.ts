import { promises as fs } from "fs";
import path from "path";

// ── Brain (Obsidian vault) paths ────────────────────────────────────────────
export const BRAIN_DIR = path.join(process.cwd(), "brain");
export const CAMPAIGNS_DIR = path.join(BRAIN_DIR, "campaigns");
export const PERSONAS_DIR = path.join(BRAIN_DIR, "personas");
export const CAMPAIGN_PERSONAS_DIR = path.join(PERSONAS_DIR, "campaign-based");
export const SCOUT_PERSONAS_DIR = path.join(PERSONAS_DIR, "scouts");
export const RULES_DIR = path.join(BRAIN_DIR, "rules");
export const WRITING_DIR = path.join(BRAIN_DIR, "writing");

export function storylineDirPath(slug: string): string {
  return path.join(CAMPAIGNS_DIR, slug, "storyline");
}
export function planPath(slug: string): string {
  return path.join(storylineDirPath(slug), "plan.md");
}
export function topicBankPath(slug: string): string {
  return path.join(storylineDirPath(slug), "topic-bank.md");
}
export function draftsDirPath(slug: string): string {
  return path.join(CAMPAIGNS_DIR, slug, "drafts");
}

// ── Per-campaign note naming ─────────────────────────────────────────────────
// Every per-campaign note gets a graph-unique, readable name so the Obsidian
// graph shows one tidy cluster per campaign instead of many identical labels.
// Notes also carry a `campaign: "[[<slug>]]"` frontmatter link back to the hub.
export function briefPath(slug: string): string {
  return path.join(CAMPAIGNS_DIR, slug, `${slug}.md`);
}
export function legacyBriefPath(slug: string): string {
  return path.join(CAMPAIGNS_DIR, slug, "campaigndetails.md");
}
export function rawDirPath(slug: string): string {
  return path.join(CAMPAIGNS_DIR, slug, "research", "raw");
}
export function rawResearchFileName(personaId: string, slug: string): string {
  return `${personaId.replace(/-persona$/, "")} — ${slug}.md`;
}
export function masterDirPath(slug: string): string {
  return path.join(CAMPAIGNS_DIR, slug, "research", "master");
}
export function campaignBaseFileName(slug: string): string {
  return `campaign base — ${slug}.md`;
}
export function scoutBaseFileName(slug: string): string {
  return `scout base — ${slug}.md`;
}
export function validationLogPath(slug: string): string {
  return path.join(
    CAMPAIGNS_DIR,
    slug,
    "research",
    `validation log — ${slug}.md`,
  );
}
/** Obsidian frontmatter link back to the campaign hub note. */
export function campaignLink(slug: string): string {
  return `campaign: "[[${slug}]]"`;
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface CampaignBrief {
  name: string;
  topic: string;
  objective: string;
  icp?: string;
  constraints?: string;
}

export interface Campaign extends CampaignBrief {
  slug: string;
  createdAt: string;
  status: string;
}

export interface PersonaFile {
  id: string; // filename without extension, e.g. "doctor-persona"
  name: string; // human label derived from the file
  stream: "campaign" | "scout";
  path: string;
  model: string; // which LLM this persona runs on (from frontmatter; default "claude")
  themes: string[]; // digest themes this persona reads (from frontmatter)
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "campaign";
}

function parseFrontmatter(md: string): {
  data: Record<string, string>;
  body: string;
} {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: md };
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { data, body: m[2] };
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// ── Campaign creation (dynamic) ──────────────────────────────────────────────
/**
 * Creates a fresh, self-contained campaign folder in the Brain and writes the
 * Phase 0 brief. The folder + research subfolders are created here at run time —
 * nothing is pre-made. Returns the final (collision-safe) slug.
 */
export async function createCampaign(brief: CampaignBrief): Promise<Campaign> {
  await fs.mkdir(CAMPAIGNS_DIR, { recursive: true });

  // collision-safe slug (from the campaign name)
  const base = slugify(brief.name || brief.topic);
  let slug = base;
  let n = 2;
  while (await pathExists(path.join(CAMPAIGNS_DIR, slug))) {
    slug = `${base}-${n++}`;
  }

  const dir = path.join(CAMPAIGNS_DIR, slug);
  await fs.mkdir(path.join(dir, "research", "raw"), { recursive: true });
  await fs.mkdir(path.join(dir, "research", "master"), { recursive: true });

  const createdAt = new Date().toISOString();
  const status = "brief";

  const md = [
    "---",
    `slug: ${slug}`,
    `name: ${brief.name}`,
    `createdAt: ${createdAt}`,
    `status: ${status}`,
    "---",
    "",
    `# ${brief.name}`,
    "",
    "## About",
    "",
    brief.topic.trim(),
    "",
    "## Objective",
    "",
    brief.objective.trim(),
    "",
    "## Target ICP",
    "",
    (brief.icp || "").trim() || "_Not specified._",
    "",
    "## Constraints",
    "",
    (brief.constraints || "").trim() || "_None specified._",
    "",
  ].join("\n");

  await fs.writeFile(briefPath(slug), md, "utf8");

  return { slug, createdAt, status, ...brief };
}

// ── Campaign reads ───────────────────────────────────────────────────────────
export async function getCampaign(slug: string): Promise<Campaign | null> {
  // new hub name first, fall back to the legacy filename for old campaigns
  let file = briefPath(slug);
  if (!(await pathExists(file))) file = legacyBriefPath(slug);
  if (!(await pathExists(file))) return null;
  const md = await fs.readFile(file, "utf8");
  const { data, body } = parseFrontmatter(md);

  const clean = (s: string) =>
    s === "_None specified._" || s === "_Not specified._" ? "" : s;
  // `About` is the new section; fall back to frontmatter topic for old campaigns
  const topic = sectionText(body, "About") || data.topic || slug;
  const objective = sectionText(body, "Objective");
  const icp = clean(sectionText(body, "Target ICP"));
  const constraints = clean(sectionText(body, "Constraints"));

  return {
    slug: data.slug || slug,
    name: data.name || data.topic || slug,
    topic,
    createdAt: data.createdAt || "",
    status: data.status || "brief",
    objective,
    icp,
    constraints,
  };
}

export async function listCampaigns(): Promise<Campaign[]> {
  if (!(await pathExists(CAMPAIGNS_DIR))) return [];
  const entries = await fs.readdir(CAMPAIGNS_DIR, { withFileTypes: true });
  const campaigns: Campaign[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const c = await getCampaign(e.name);
    if (c) campaigns.push(c);
  }
  // newest first
  return campaigns.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Updates a campaign's status in its brief note (handles new + legacy names). */
export async function setCampaignStatus(
  slug: string,
  status: string,
): Promise<void> {
  let file = briefPath(slug);
  if (!(await pathExists(file))) file = legacyBriefPath(slug);
  try {
    const md = await fs.readFile(file, "utf8");
    await fs.writeFile(
      file,
      md.replace(/^status:.*$/m, `status: ${status}`),
      "utf8",
    );
  } catch {
    /* non-fatal */
  }
}

/** Permanently deletes a campaign folder and everything under it. */
export async function deleteCampaign(slug: string): Promise<void> {
  const dir = path.join(CAMPAIGNS_DIR, slug);
  // guard: must live under CAMPAIGNS_DIR
  if (!path.resolve(dir).startsWith(path.resolve(CAMPAIGNS_DIR) + path.sep))
    throw new Error("Invalid campaign slug.");
  await fs.rm(dir, { recursive: true, force: true });
}

function sectionText(body: string, heading: string): string {
  const re = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?:\\n##\\s|$)`);
  const m = body.match(re);
  return m ? m[1].trim() : "";
}

// ── Persona discovery (folder-driven) ────────────────────────────────────────
/**
 * Reads whatever persona files currently exist in the Brain. The pipeline is
 * count-agnostic: add/remove a file and this reflects it with no code change.
 */
export async function listPersonas(): Promise<PersonaFile[]> {
  const read = async (
    dir: string,
    stream: "campaign" | "scout",
  ): Promise<PersonaFile[]> => {
    if (!(await pathExists(dir))) return [];
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
    const out: PersonaFile[] = [];
    for (const f of files) {
      const p = path.join(dir, f);
      const { data } = parseFrontmatter(await fs.readFile(p, "utf8"));
      out.push({
        id: f.replace(/\.md$/, ""),
        name: prettyName(f),
        stream,
        path: p,
        model: (data.model || "claude").trim().toLowerCase(),
        themes: parseThemes(data.themes),
      });
    }
    return out;
  };
  const [campaign, scout] = await Promise.all([
    read(CAMPAIGN_PERSONAS_DIR, "campaign"),
    read(SCOUT_PERSONAS_DIR, "scout"),
  ]);
  return [...campaign, ...scout];
}

/** Parses a `themes: [A, B, C]` frontmatter value into a string array. */
function parseThemes(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Reads a persona file's prompt body (frontmatter stripped). */
export async function readPersonaBody(p: string): Promise<string> {
  const { body } = parseFrontmatter(await fs.readFile(p, "utf8"));
  return body.trim();
}

function prettyName(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .replace(/-persona$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
