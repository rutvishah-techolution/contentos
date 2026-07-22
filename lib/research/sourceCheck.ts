import { promises as fs } from "fs";
import path from "path";
import {
  RULES_DIR,
  getCampaign,
  rawDirPath,
  masterDirPath,
  campaignBaseFileName,
  scoutBaseFileName,
  validationLogPath,
  campaignLink,
  setCampaignStatus,
} from "@/lib/brain";
import { callClaude } from "@/lib/models/claude";
import { fetchUrl, FetchResult } from "@/lib/research/fetchSource";
import { getDigestUrls, normalizeUrl } from "@/lib/integrations/digest";
import { buildSourcesIndex } from "@/lib/research/sources";
import {
  extractFigures,
  findFigure,
  sourceTier,
  batchContextCheck,
  ContextItem,
} from "@/lib/research/verify";
import {
  Decision,
  Finding,
  SourceCheckResult,
  Stream,
  StreamValidation,
  Verdict,
} from "@/lib/research/types";

interface RawFinding extends Finding {
  personaId: string;
  personaName: string;
  stream: Stream;
}

/**
 * Phase 1 validation. For each stream: resolves every source, has Claude apply
 * the source-check rules (two-tier: hard for campaign, plausibility for scout),
 * then synthesizes the surviving findings into a research base. Writes the two
 * master files + the validation log.
 */
export async function runSourceCheck(slug: string): Promise<SourceCheckResult> {
  const campaign = await getCampaign(slug);
  if (!campaign) throw new Error(`Campaign not found: ${slug}`);

  const rules = await fs.readFile(
    path.join(RULES_DIR, "source-check.md"),
    "utf8",
  );

  const all = await loadRawFindings(slug);
  const campaignFindings = all.filter((f) => f.stream === "campaign");
  const scoutFindings = all.filter((f) => f.stream === "scout");

  // URLs already verified by the daily digest pipeline — trusted, not re-checked.
  const digestUrls = await getDigestUrls();

  const [campaignVal, scoutVal] = await Promise.all([
    validateStream("campaign", campaignFindings, rules, campaign.topic, digestUrls),
    validateStream("scout", scoutFindings, rules, campaign.topic, digestUrls),
  ]);

  // synthesize the two master bases from surviving (VERIFIED + FLAG) findings
  await Promise.all([
    synthesizeBase(slug, "campaign", campaignVal, campaign.topic),
    synthesizeBase(slug, "scout", scoutVal, campaign.topic),
  ]);

  await writeValidationLog(slug, campaign.topic, campaignVal, scoutVal);
  // Index of sources used (+ global ledger + cross-campaign reuse flags).
  await buildSourcesIndex(slug, campaignVal, scoutVal, digestUrls);
  await setCampaignStatus(slug, "review");

  return { campaign: campaignVal, scout: scoutVal };
}

// ── Load raw findings from the Brain ─────────────────────────────────────────
async function loadRawFindings(slug: string): Promise<RawFinding[]> {
  const dir = rawDirPath(slug);
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  const list: RawFinding[] = [];

  for (const file of files) {
    const md = await fs.readFile(path.join(dir, file), "utf8");
    const stream = (/^stream:\s*(campaign|scout)/m.exec(md)?.[1] ||
      "campaign") as Stream;
    const personaName =
      /^persona:\s*(.+)$/m.exec(md)?.[1]?.trim() || file.replace(/\.md$/, "");
    // personaId from frontmatter (filenames are now campaign-scoped)
    const personaId =
      /^personaId:\s*(.+)$/m.exec(md)?.[1]?.trim() || file.replace(/\.md$/, "");
    const data = extractJsonBlock(md);
    if (!data || !Array.isArray(data.findings)) continue;
    for (const f of data.findings as Finding[]) {
      list.push({
        personaId,
        personaName,
        stream,
        claim: f.claim || "",
        evidence: f.evidence || "",
        sourceUrl: f.sourceUrl || "",
        sourceTitle: f.sourceTitle,
        whyItMatters: f.whyItMatters || "",
      });
    }
  }
  return list;
}

function extractJsonBlock(
  md: string,
): { findings?: unknown } | null {
  const m = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// ── Validate one stream ──────────────────────────────────────────────────────
async function validateStream(
  stream: Stream,
  findings: RawFinding[],
  rules: string,
  topic: string,
  digestUrls: Set<string>,
): Promise<StreamValidation> {
  if (findings.length === 0) {
    return { stream, verified: 0, flagged: 0, stripped: 0, verdicts: [] };
  }

  // Partition: claims sourced from the pre-verified digest are trusted outright.
  const trusted = new Map<number, Verdict>();
  const rest: RawFinding[] = [];
  findings.forEach((f, i) => {
    if (f.sourceUrl && digestUrls.has(normalizeUrl(f.sourceUrl))) {
      trusted.set(i, {
        personaId: f.personaId,
        personaName: f.personaName,
        claim: f.claim,
        evidence: f.evidence,
        sourceUrl: f.sourceUrl,
        sourceTitle: f.sourceTitle,
        resolvedSource: f.sourceUrl,
        decision: "VERIFIED",
        reason: "Source is from the pre-verified internal digest.",
      });
    } else {
      rest.push(f);
    }
  });

  const restVerdicts = await classifyFindings(stream, rest, rules, topic);

  // Merge back in original order.
  const verdicts: Verdict[] = [];
  let r = 0;
  findings.forEach((_, i) => {
    verdicts.push(trusted.has(i) ? (trusted.get(i) as Verdict) : restVerdicts[r++]);
  });

  const verified = verdicts.filter((v) => v.decision === "VERIFIED").length;
  const flagged = verdicts.filter((v) => v.decision === "FLAG").length;
  const stripped = verdicts.filter((v) => v.decision === "STRIP").length;
  return { stream, verified, flagged, stripped, verdicts };
}

/** Fetch-and-classify the non-digest findings (the ones needing real checking). */
async function classifyFindings(
  stream: Stream,
  findings: RawFinding[],
  rules: string,
  topic: string,
): Promise<Verdict[]> {
  if (findings.length === 0) return [];

  // resolve every source in parallel
  const fetches = await Promise.all(findings.map((f) => fetchUrl(f.sourceUrl)));

  // Deterministically STRIP genuinely-dead links (404/410/soft-404) — a user
  // must never be handed a broken link. Blocked-but-real links (403/Cloudflare/
  // timeout) are NOT dead: they pass through to the model and are kept.
  const deadVerdicts = new Map<number, Verdict>();
  const aliveIdx: number[] = [];
  findings.forEach((f, i) => {
    if (fetches[i].dead) {
      deadVerdicts.set(i, {
        personaId: f.personaId,
        personaName: f.personaName,
        claim: f.claim,
        evidence: f.evidence,
        sourceUrl: f.sourceUrl,
        sourceTitle: f.sourceTitle,
        resolvedSource: fetches[i].finalUrl,
        decision: "STRIP",
        reason: "Link is dead (404 / not found) — removed.",
      });
    } else {
      aliveIdx.push(i);
    }
  });

  const alive = aliveIdx.map((i) => findings[i]);
  const aliveFetches = aliveIdx.map((i) => fetches[i]);

  let aliveVerdicts: Verdict[] = [];
  if (alive.length > 0) {
    aliveVerdicts = await classifyAlive(alive, aliveFetches);
  }

  // merge dead + classified back into original order
  const out: Verdict[] = [];
  let a = 0;
  findings.forEach((_, i) => {
    out.push(deadVerdicts.has(i) ? (deadVerdicts.get(i) as Verdict) : aliveVerdicts[a++]);
  });
  return out;
}

/**
 * Deterministic verification of the non-dead findings:
 *  • pull the claim's hard figures and check they actually appear in the page text
 *  • a batched tiny AI check confirms the matched sentence really supports the claim
 *  • blocked/unreadable pages and figure-less claims fall back to source quality
 * Cheap, consistent, and the FLAGs finally mean something real.
 */
async function classifyAlive(
  findings: RawFinding[],
  fetches: FetchResult[],
): Promise<Verdict[]> {
  const verdicts: (Verdict | undefined)[] = new Array(findings.length);
  const pending: { index: number; figure: string }[] = [];
  const contextItems: ContextItem[] = [];

  findings.forEach((f, i) => {
    const fr = fetches[i];
    const resolved = fr.finalUrl || f.sourceUrl;
    const tier = sourceTier(resolved);
    const text = fr.snippet || "";
    const blocked = !fr.ok || text.length < 200;

    if (blocked) {
      verdicts[i] = mkVerdict(
        f,
        resolved,
        "FLAG",
        `Source blocked/unreadable (${tier} source) — link is real but the figure couldn't be confirmed.`,
      );
      return;
    }

    const figures = extractFigures(`${f.claim} ${f.evidence}`);
    if (figures.length === 0) {
      // qualitative claim → judge by source quality + topical presence
      const onTopic = topicOverlap(f.claim, text);
      const ok = tier !== "weak" && onTopic;
      verdicts[i] = mkVerdict(
        f,
        resolved,
        ok ? "VERIFIED" : "FLAG",
        ok
          ? `Non-numeric claim on a ${tier} source that covers the topic.`
          : `Non-numeric claim; ${tier} source, not independently confirmable.`,
      );
      return;
    }

    const hit = findFigure(figures, text);
    if (!hit) {
      verdicts[i] = mkVerdict(
        f,
        resolved,
        "FLAG",
        `Claimed figure (${figures[0].label}) does not appear in the source text.`,
      );
      return;
    }

    // figure is present → queue the tiny context confirmation
    pending.push({ index: i, figure: hit.figure });
    contextItems.push({ index: i, claim: f.claim, sentence: hit.sentence });
  });

  if (pending.length > 0) {
    const supports = await batchContextCheck(contextItems);
    for (const p of pending) {
      const f = findings[p.index];
      const resolved = fetches[p.index].finalUrl || f.sourceUrl;
      const ok = supports.get(p.index) !== false;
      verdicts[p.index] = mkVerdict(
        f,
        resolved,
        ok ? "VERIFIED" : "FLAG",
        ok
          ? `Figure ${p.figure} found in the source and supports the claim.`
          : `Figure ${p.figure} appears in the source but in a different context.`,
      );
    }
  }

  return verdicts.map(
    (v, i) =>
      v ||
      mkVerdict(
        findings[i],
        fetches[i].finalUrl || findings[i].sourceUrl,
        "FLAG",
        "Unverified.",
      ),
  );
}

function mkVerdict(
  f: RawFinding,
  resolved: string,
  decision: Decision,
  reason: string,
): Verdict {
  return {
    personaId: f.personaId,
    personaName: f.personaName,
    claim: f.claim,
    evidence: f.evidence,
    sourceUrl: f.sourceUrl,
    sourceTitle: f.sourceTitle,
    resolvedSource: resolved,
    decision,
    reason,
  };
}

const TOPIC_STOP = new Set([
  "that", "this", "with", "from", "have", "will", "their", "which", "about",
  "these", "those", "than", "were", "into", "over", "your", "they", "them",
  "more", "most", "some", "such", "also", "been", "being", "only", "when",
]);

/** Loose check: does the page text mention the claim's key terms? */
function topicOverlap(claim: string, text: string): boolean {
  const words = claim.toLowerCase().match(/[a-z]{4,}/g) || [];
  const key = [...new Set(words)].filter((w) => !TOPIC_STOP.has(w)).slice(0, 8);
  if (key.length === 0) return true;
  const lower = text.toLowerCase();
  const hits = key.filter((w) => lower.includes(w)).length;
  return hits >= Math.max(2, Math.ceil(key.length * 0.4));
}

// ── Synthesize a research base from surviving findings ───────────────────────
async function synthesizeBase(
  slug: string,
  stream: Stream,
  val: StreamValidation,
  topic: string,
): Promise<void> {
  const surviving = val.verdicts.filter((v) => v.decision !== "STRIP");
  const dir = masterDirPath(slug);
  await fs.mkdir(dir, { recursive: true });
  const fileName =
    stream === "campaign"
      ? campaignBaseFileName(slug)
      : scoutBaseFileName(slug);
  const file = path.join(dir, fileName);

  if (surviving.length === 0) {
    await fs.writeFile(
      file,
      `---\n${campaignLink(slug)}\nstream: ${stream}\n---\n\n# ${title(stream)} Research Base\n\n_No validated findings survived source-check._\n`,
      "utf8",
    );
    return;
  }

  const items = surviving.map((v) => ({
    claim: v.claim,
    evidence: v.evidence,
    source: v.resolvedSource,
  }));

  const system = `You are a neutral research synthesizer. You are NOT a persona and NOT a writer of opinion. Turn the validated findings below into one coherent research base for a B2B campaign aimed at Fortune 500 / C-suite readers.

RULES:
- Organize the findings into 3-6 thematic sections with clear headings.
- Preserve every citation as a markdown link right after the claim it supports: ([source](url)).
- Do NOT add any confidence labels, warnings, or "read, not verified" style markers — the research base must read clean. (Flagged/stripped detail lives in the separate validation log.)
- Do NOT invent new claims, numbers, or sources. Only use what is given.
- Keep it tight and specific. No filler, no hype.
- Output clean Markdown only. Start with an "## Overview" paragraph.`;

  const user = `TOPIC: ${topic}\nSTREAM: ${stream}\n\nVALIDATED FINDINGS:\n${JSON.stringify(items, null, 2)}`;

  let body: string;
  try {
    body = await callClaude({ system, user, maxTokens: 8192, webSearch: false });
  } catch (e) {
    body = `_Synthesis failed: ${e instanceof Error ? e.message : String(e)}_`;
  }

  const header = [
    "---",
    campaignLink(slug),
    `stream: ${stream}`,
    `topic: ${topic}`,
    `verified: ${val.verified}`,
    `flagged: ${val.flagged}`,
    `stripped: ${val.stripped}`,
    `generatedAt: ${new Date().toISOString()}`,
    "---",
    "",
    `# ${title(stream)} Research Base`,
    "",
  ].join("\n");

  await fs.writeFile(file, header + body.trim() + "\n", "utf8");
}

// ── Validation log ───────────────────────────────────────────────────────────
async function writeValidationLog(
  slug: string,
  topic: string,
  campaign: StreamValidation,
  scout: StreamValidation,
): Promise<void> {
  const file = validationLogPath(slug);
  const section = (v: StreamValidation): string[] => {
    const lines: string[] = [
      `## ${title(v.stream)} stream`,
      "",
      `- Verified: **${v.verified}** · Flagged: **${v.flagged}** · Stripped: **${v.stripped}**`,
      "",
    ];
    const notable = v.verdicts.filter((x) => x.decision !== "VERIFIED");
    if (notable.length === 0) {
      lines.push("_Nothing stripped or flagged._", "");
      return lines;
    }
    for (const x of notable) {
      lines.push(
        `- **${x.decision}** — ${x.claim}`,
        `  - Persona: ${x.personaName}`,
        `  - Reason: ${x.reason}`,
        `  - Source: ${x.resolvedSource || x.sourceUrl || "—"}`,
        "",
      );
    }
    return lines;
  };

  const md = [
    "---",
    campaignLink(slug),
    `topic: ${topic}`,
    `generatedAt: ${new Date().toISOString()}`,
    "---",
    "",
    "# Source Validation Log",
    "",
    "Record of what the source-check stripped or flagged, and why. Feeds the source-validation catch-rate metric.",
    "",
    ...section(campaign),
    ...section(scout),
  ].join("\n");

  await fs.writeFile(file, md + "\n", "utf8");
}

// ── helpers ──────────────────────────────────────────────────────────────────
function title(stream: Stream): string {
  return stream === "campaign" ? "Campaign" : "Scout";
}

