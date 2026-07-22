import { promises as fs } from "fs";
import path from "path";
import { BRAIN_DIR, CAMPAIGNS_DIR, campaignLink } from "@/lib/brain";
import {
  getDigestIndex,
  normalizeUrl,
  DigestItem,
} from "@/lib/integrations/digest";
import { fetchUrl } from "@/lib/research/fetchSource";
import { StreamValidation, Stream } from "@/lib/research/types";

export type Origin = "digest" | "web";

export interface SourceEntry {
  title: string;
  url: string; // real, resolved publisher URL
  origin: Origin;
  personas: string[]; // who used it
  publishedAt?: string; // YYYY-MM-DD if known
  reusedIn: string[]; // other campaign slugs that also used this source
}

export interface SourcesIndex {
  campaign: SourceEntry[];
  scout: SourceEntry[];
}

const LEDGER = path.join(BRAIN_DIR, "reference", "used-sources.json");

/**
 * Builds the per-campaign "index of sources used" (like a book's bibliography),
 * enriches each with title + publish date + origin, records them in the global
 * used-source ledger, and flags which sources were reused across campaigns.
 */
export async function buildSourcesIndex(
  slug: string,
  campaignVal: StreamValidation,
  scoutVal: StreamValidation,
  digestUrls: Set<string>,
): Promise<SourcesIndex> {
  const digestIndex = await getDigestIndex();

  const campaign = await buildStream(campaignVal, digestUrls, digestIndex);
  const scout = await buildStream(scoutVal, digestUrls, digestIndex);

  // record in the global ledger + compute cross-campaign reuse
  const reuse = await updateLedger(slug, [...campaign, ...scout]);
  for (const e of [...campaign, ...scout]) {
    e.reusedIn = (reuse.get(normalizeUrl(e.url)) || []).filter((s) => s !== slug);
  }

  await writeSourcesFile(slug, { campaign, scout });
  return { campaign, scout };
}

async function buildStream(
  val: StreamValidation,
  digestUrls: Set<string>,
  digestIndex: Map<string, DigestItem>,
): Promise<SourceEntry[]> {
  const byUrl = new Map<string, SourceEntry>();

  for (const v of val.verdicts.filter((x) => x.decision !== "STRIP")) {
    const url = v.resolvedSource || v.sourceUrl;
    if (!url) continue;
    const key = normalizeUrl(url);
    if (!key) continue;
    if (!byUrl.has(key)) {
      const di = digestIndex.get(key);
      byUrl.set(key, {
        // digest headline → model-provided title → filled later from page/slug
        title: di?.headline || v.sourceTitle || "",
        url,
        origin: digestUrls.has(key) ? "digest" : "web",
        personas: [],
        publishedAt: di?.date,
        reusedIn: [],
      });
    }
    const e = byUrl.get(key) as SourceEntry;
    if (!e.personas.includes(v.personaName)) e.personas.push(v.personaName);
  }

  // Enrich ALL sources by fetching the page — bounded, parallel.
  // For digest sources this recovers the article's TRUE publish date (the
  // digest only stores the day it was picked, which can be 2-3 days later).
  await Promise.all(
    [...byUrl.values()].map(async (e) => {
      try {
        const r = await fetchUrl(e.url);
        if (r.finalUrl && r.ok) e.url = r.finalUrl;
        // real publish date overrides the digest's pick-date; keep old on failure
        if (r.publishedAt) e.publishedAt = r.publishedAt;
        // borrow the page title only if we don't already have a good one
        // (model sourceTitle wins; fetchUrl returns undefined for junk titles)
        if (e.origin === "web" && !e.title && r.title) e.title = r.title;
      } catch {
        /* leave as-is */
      }
    }),
  );

  // title fallback chain: sourceTitle/fetched → readable URL slug → host
  for (const e of byUrl.values()) {
    if (!e.title) e.title = slugTitle(e.url) || hostOf(e.url);
  }

  // newest first; unknown dates sink to the bottom
  return [...byUrl.values()].sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

// ── Global ledger ────────────────────────────────────────────────────────────
interface LedgerEntry {
  title: string;
  url: string;
  publishedAt?: string;
  campaigns: string[];
}

async function updateLedger(
  slug: string,
  entries: SourceEntry[],
): Promise<Map<string, string[]>> {
  let ledger: Record<string, LedgerEntry> = {};
  try {
    ledger = JSON.parse(await fs.readFile(LEDGER, "utf8"));
  } catch {
    /* fresh ledger */
  }

  for (const e of entries) {
    const key = normalizeUrl(e.url);
    if (!key) continue;
    const cur =
      ledger[key] || ({ title: e.title, url: e.url, campaigns: [] } as LedgerEntry);
    if (!cur.campaigns.includes(slug)) cur.campaigns.push(slug);
    if (!cur.title && e.title) cur.title = e.title;
    if (!cur.publishedAt && e.publishedAt) cur.publishedAt = e.publishedAt;
    ledger[key] = cur;
  }

  await fs.mkdir(path.dirname(LEDGER), { recursive: true });
  await fs.writeFile(LEDGER, JSON.stringify(ledger, null, 2), "utf8");

  const map = new Map<string, string[]>();
  for (const [k, v] of Object.entries(ledger)) map.set(k, v.campaigns);
  return map;
}

// ── Persist the per-campaign sources note (readable + machine-readable) ──────
async function writeSourcesFile(
  slug: string,
  index: SourcesIndex,
): Promise<void> {
  const file = path.join(CAMPAIGNS_DIR, slug, "research", `sources — ${slug}.md`);
  const section = (title: string, list: SourceEntry[]): string[] => {
    const lines = [`## ${title} (${list.length})`, ""];
    if (list.length === 0) lines.push("_None._", "");
    for (const e of list) {
      const age = e.publishedAt ? e.publishedAt : "date unknown";
      const reuse =
        e.reusedIn.length > 0
          ? `reused in ${e.reusedIn.length} other campaign(s)`
          : "unique to this campaign";
      lines.push(
        `- [${e.title}](${e.url})`,
        `  - ${age} · ${e.origin} · used by ${e.personas.join(", ")} · ${reuse}`,
        "",
      );
    }
    return lines;
  };

  const md = [
    "---",
    campaignLink(slug),
    `generatedAt: ${new Date().toISOString()}`,
    "---",
    "",
    "# Index of Sources Used",
    "",
    ...section("Campaign sources", index.campaign),
    ...section("Scout sources", index.scout),
    "## Data",
    "",
    "```json",
    JSON.stringify(index, null, 2),
    "```",
    "",
  ].join("\n");

  await fs.writeFile(file, md, "utf8");
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 60);
  }
}

/** Turns a URL's last path segment into a readable title, e.g.
 *  /2026/07/ai-cost-optimization-strategies → "Ai Cost Optimization Strategies" */
function slugTitle(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const last = parts.reverse().find((p) => /[a-z].*[a-z].*[a-z]/i.test(p));
    if (!last) return "";
    const words = last
      .replace(/\.(html?|php|aspx)$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\d{4,}\b/g, "")
      .trim();
    if (words.split(" ").length < 2) return ""; // too thin to be a title
    return words
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .slice(0, 120);
  } catch {
    return "";
  }
}
