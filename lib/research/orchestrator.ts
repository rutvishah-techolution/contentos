import { promises as fs } from "fs";
import path from "path";
import {
  Campaign,
  PersonaFile,
  getCampaign,
  listPersonas,
  readPersonaBody,
  rawDirPath,
  rawResearchFileName,
  campaignLink,
  setCampaignStatus,
} from "@/lib/brain";
import { callModel, normalizeModel } from "@/lib/models/router";
import { syncDigest, DigestItem } from "@/lib/integrations/digest";
import { fetchUrl } from "@/lib/research/fetchSource";
import { selectArticles } from "@/lib/research/selection";
import { PersonaResearch } from "@/lib/research/types";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseResearch,
} from "@/lib/research/prompt";

/**
 * Runs the full Phase 1 research: reads whatever personas exist (folder-driven),
 * runs them all in parallel and independently, and writes one raw file per
 * persona into the campaign's research/raw/ folder. A single persona failing
 * does not stop the others.
 */
export async function runResearch(
  slug: string,
  feedback = "",
): Promise<PersonaResearch[]> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);
  if (feedback) console.log(`[research] re-run with feedback: ${feedback.slice(0, 120)}`);

  const personas = await listPersonas();
  if (personas.length === 0) throw new Error("No personas found in the Brain.");

  // Pull the freshest verified digest before research begins (best-effort).
  try {
    const s = await syncDigest();
    console.log(
      `[research] digest synced: ${s.total} items, newest ${s.latestDate} (${s.pullNote})`,
    );
  } catch (e) {
    console.warn(
      `[research] digest sync skipped: ${e instanceof Error ? e.message : e}`,
    );
  }

  await setCampaignStatus(slug, "researching");

  // Round-robin article selection: each persona autonomously claims the digest
  // articles it wants to write about, with no duplication across personas.
  const selection = await selectArticles(campaign, personas);
  console.log(
    `[research] article selection from pool of ${selection.poolSize}: ` +
      personas
        .map((p) => `${p.id}=${selection.assignments.get(p.id)?.length || 0}`)
        .join(", "),
  );

  const results = await Promise.all(
    personas.map((p) =>
      runOnePersona(
        slug,
        campaign,
        p,
        selection.assignments.get(p.id) || [],
        feedback,
      ),
    ),
  );

  await setCampaignStatus(slug, "review");
  return results;
}

async function runOnePersona(
  slug: string,
  campaign: Campaign,
  persona: PersonaFile,
  digest: DigestItem[],
  feedback = "",
): Promise<PersonaResearch> {
  const generatedAt = new Date().toISOString();
  const model = normalizeModel(persona.model);
  const base: PersonaResearch = {
    personaId: persona.id,
    personaName: persona.name,
    stream: persona.stream,
    model,
    summary: "",
    findings: [],
    generatedAt,
  };

  try {
    const personaContent = await readPersonaBody(persona.path);
    const system = buildSystemPrompt(personaContent);
    const user = buildUserPrompt(campaign, persona.stream, digest, feedback);

    const maxTokens = model === "gemini" ? 8192 : 4096;
    const raw = await callModel(model, {
      system,
      user,
      maxTokens,
      webSearch: true,
    });

    const { summary, findings } = parseResearch(raw);
    // Gemini grounding returns short-lived vertexaisearch redirect URLs.
    // Resolve them to the real publisher URL NOW, while they're still alive.
    await resolveRedirects(findings);
    const result: PersonaResearch = { ...base, summary, findings };
    await writeRawFile(slug, result);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const result: PersonaResearch = { ...base, error: message };
    await writeRawFile(slug, result);
    return result;
  }
}

const REDIRECT_RE = /vertexaisearch\.cloud\.google\.com\/grounding-api-redirect/i;

/** Follows grounding-redirect URLs to their real publisher URL (done at
 *  generation time, before the short-lived redirects expire). */
async function resolveRedirects(
  findings: { sourceUrl: string }[],
): Promise<void> {
  await Promise.all(
    findings.map(async (f) => {
      if (!f.sourceUrl || !REDIRECT_RE.test(f.sourceUrl)) return;
      try {
        const r = await fetchUrl(f.sourceUrl);
        if (r.finalUrl && !REDIRECT_RE.test(r.finalUrl)) f.sourceUrl = r.finalUrl;
      } catch {
        /* keep the redirect; source-check will handle if it dies */
      }
    }),
  );
}

async function writeRawFile(slug: string, r: PersonaResearch): Promise<void> {
  const dir = rawDirPath(slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, rawResearchFileName(r.personaId, slug)),
    renderRawMarkdown(r, slug),
    "utf8",
  );
}

function renderRawMarkdown(r: PersonaResearch, slug: string): string {
  const frontmatter: string[] = [
    "---",
    campaignLink(slug),
    `persona: ${r.personaName}`,
    `personaId: ${r.personaId}`,
    `stream: ${r.stream}`,
    `model: ${r.model}`,
    `generatedAt: ${r.generatedAt}`,
    `findingCount: ${r.findings.length}`,
  ];
  if (r.error) frontmatter.push(`error: ${r.error.replace(/\n/g, " ")}`);
  frontmatter.push("---");

  const lines: string[] = [...frontmatter, "", `# ${r.personaName} — Raw Research`, ""];

  if (r.error) {
    lines.push(`> ⚠️ This persona failed to complete: ${r.error}`, "");
  }

  if (r.summary) lines.push("## Summary", "", r.summary, "");

  if (r.findings.length) {
    lines.push("## Findings", "");
    r.findings.forEach((f, i) => {
      lines.push(
        `### ${i + 1}. ${f.claim}`,
        "",
        `- **Evidence:** ${f.evidence}`,
        `- **Source:** ${f.sourceUrl}`,
        `- **Why it matters:** ${f.whyItMatters}`,
        "",
      );
    });
  }

  // machine-readable block for the source-check step + results view
  lines.push(
    "## Data",
    "",
    "```json",
    JSON.stringify(
      { summary: r.summary, findings: r.findings, error: r.error || null },
      null,
      2,
    ),
    "```",
    "",
  );

  return lines.join("\n") + "\n";
}
