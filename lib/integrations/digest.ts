import { promises as fs } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { BRAIN_DIR } from "@/lib/brain";

const execFileAsync = promisify(execFile);

const REPO_PATH =
  process.env.DIGEST_REPO_PATH || "/Users/rutvi/News-digest/daily-news-dump";
const DIGEST_DIR = path.join(BRAIN_DIR, "reference", "digest");
const SNAPSHOT = path.join(DIGEST_DIR, "digest.json");
const KEEP_DAYS = 120; // how far back to keep in the Brain snapshot

/** One normalized, pre-verified news item from your daily pipeline. */
export interface DigestItem {
  date: string; // YYYY-MM-DD
  kind: "news" | "b2b";
  headline: string;
  summary: string;
  source: string;
  url: string;
  theme: string;
  keyNotes?: string[];
}

export interface SyncSummary {
  pulled: boolean;
  pullNote: string;
  newsCount: number;
  b2bCount: number;
  total: number;
  latestDate: string;
}

// ── Sync: git pull → read both feeds → normalize → snapshot into the Brain ────
export async function syncDigest(): Promise<SyncSummary> {
  const pull = await gitPull();

  const [news, b2b] = await Promise.all([readCuratedNews(), readB2BDigests()]);
  const cutoff = daysAgoISO(KEEP_DAYS);
  const items = [...news, ...b2b]
    .filter((i) => i.date >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date));

  await fs.mkdir(DIGEST_DIR, { recursive: true });
  await fs.writeFile(SNAPSHOT, JSON.stringify(items, null, 2), "utf8");
  await writeIndex(items);

  return {
    pulled: pull.ok,
    pullNote: pull.note,
    newsCount: news.length,
    b2bCount: b2b.length,
    total: items.length,
    latestDate: items[0]?.date || "—",
  };
}

async function gitPull(): Promise<{ ok: boolean; note: string }> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", REPO_PATH, "pull", "--quiet"], {
      timeout: 30000,
    });
    return { ok: true, note: stdout.trim() || "up to date" };
  } catch (e) {
    // Best-effort: if pull fails (offline etc.), we still use the local files.
    return {
      ok: false,
      note: `pull skipped: ${e instanceof Error ? e.message.slice(0, 120) : "error"}`,
    };
  }
}

// ── Readers ──────────────────────────────────────────────────────────────────
async function readCuratedNews(): Promise<DigestItem[]> {
  const dir = path.join(REPO_PATH, "data");
  const out: DigestItem[] = [];
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return out;
  }
  for (const f of files) {
    const m = f.match(/^(\d{4}-\d{2}-\d{2})-curated\.json$/);
    if (!m) continue;
    const date = m[1];
    try {
      const arr = JSON.parse(await fs.readFile(path.join(dir, f), "utf8"));
      if (!Array.isArray(arr)) continue;
      for (const it of arr) {
        if (!it?.headline || !it?.url) continue;
        out.push({
          date,
          kind: "news",
          headline: String(it.headline),
          summary: String(it.summary || ""),
          source: String(it.source || ""),
          url: String(it.url),
          theme: String(it.theme || ""),
        });
      }
    } catch {
      /* skip bad file */
    }
  }
  return out;
}

async function readB2BDigests(): Promise<DigestItem[]> {
  const dir = path.join(REPO_PATH, "b2b-digests", "daily");
  const out: DigestItem[] = [];
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return out;
  }
  for (const f of files) {
    const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
    if (!m) continue;
    try {
      const it = JSON.parse(await fs.readFile(path.join(dir, f), "utf8"));
      if (!it?.headline || !it?.url) continue;
      const keyNotes = Array.isArray(it.keyNotes) ? it.keyNotes.map(String) : [];
      out.push({
        date: String(it.date || m[1]),
        kind: "b2b",
        headline: String(it.headline),
        summary: keyNotes.join(" ") || String(it.summary || ""),
        source: String(it.source || ""),
        url: String(it.url),
        theme: String(it.topic || it.theme || ""),
        keyNotes,
      });
    } catch {
      /* skip bad file */
    }
  }
  return out;
}

// ── Retrieval: topic-relevant + recent items ─────────────────────────────────
const STOP = new Set([
  "the","a","an","and","or","for","to","of","in","on","with","we","our","help",
  "based","their","give","ready","day","where","companies","company","map","out",
  "that","this","are","is","by","from","as","at","it","its","into","about","how",
  "workshop","three",
]);

async function loadSnapshot(): Promise<DigestItem[]> {
  try {
    return JSON.parse(await fs.readFile(SNAPSHOT, "utf8"));
  } catch {
    return [];
  }
}

/** Normalizes a URL for comparison (drops protocol, www, query, trailing slash). */
export function normalizeUrl(u: string): string {
  return (u || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[?#]/)[0]
    .replace(/\/+$/, "");
}

/** The set of normalized URLs present in the verified digest snapshot. */
export async function getDigestUrls(): Promise<Set<string>> {
  const items = await loadSnapshot();
  return new Set(items.map((i) => normalizeUrl(i.url)).filter(Boolean));
}

/** Normalized-URL → digest item, for enriching sources with title + date. */
export async function getDigestIndex(): Promise<Map<string, DigestItem>> {
  const items = await loadSnapshot();
  const m = new Map<string, DigestItem>();
  for (const it of items) {
    const k = normalizeUrl(it.url);
    if (k && !m.has(k)) m.set(k, it);
  }
  return m;
}

function tokenize(topic: string): string[] {
  return (topic.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (t) => t.length > 2 && !STOP.has(t),
  );
}

function recencyScore(date: string, now: number): number {
  const daysOld = Math.max(
    0,
    (now - new Date(date + "T00:00:00Z").getTime()) / 86400000,
  );
  return Math.max(0, 1 - daysOld / KEEP_DAYS);
}

export async function getRelevantDigest(
  topic: string,
  limit = 20,
): Promise<DigestItem[]> {
  const items = await loadSnapshot();
  const tokens = tokenize(topic);
  const now = Date.now();
  return items
    .map((it) => {
      const text =
        `${it.headline} ${it.summary} ${it.theme} ${(it.keyNotes || []).join(" ")}`.toLowerCase();
      let rel = 0;
      for (const t of tokens) if (text.includes(t)) rel++;
      return { it, score: rel * 2 + recencyScore(it.date, now) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.it);
}

/**
 * Digest items for a specific persona: scored by (theme match ∩ its themes) +
 * (topic relevance) + recency. Theme-matching items rise to the top; if a
 * persona's themes are sparse for this topic, topically-relevant recent items
 * fill the rest. `null` themes → falls back to plain topic relevance.
 */
export async function getDigestForPersona(
  topic: string,
  themes: string[],
  limit = 12,
): Promise<DigestItem[]> {
  const items = await loadSnapshot();
  if (items.length === 0) return [];
  const tokens = tokenize(topic);
  const themeSet = themes.map((t) => t.toLowerCase());
  const now = Date.now();

  return items
    .map((it) => {
      const itTheme = (it.theme || "").toLowerCase();
      const themeMatch = themeSet.some(
        (t) => t && (itTheme.includes(t) || t.includes(itTheme)),
      )
        ? 1
        : 0;
      const text =
        `${it.headline} ${it.summary} ${it.theme} ${(it.keyNotes || []).join(" ")}`.toLowerCase();
      let rel = 0;
      for (const t of tokens) if (text.includes(t)) rel++;
      const score = themeMatch * 5 + rel * 2 + recencyScore(it.date, now);
      return { it, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.it);
}

// ── Human-readable index for Obsidian ────────────────────────────────────────
async function writeIndex(items: DigestItem[]): Promise<void> {
  const latest = items.slice(0, 15);
  const md = [
    "# Verified Digest (snapshot)",
    "",
    `Synced from the daily AI Content Intelligence pipeline. ${items.length} items, newest ${items[0]?.date || "—"}.`,
    "",
    "## Latest",
    "",
    ...latest.map(
      (i) => `- **${i.date}** [${i.kind}] ${i.headline} — [${i.source}](${i.url})`,
    ),
    "",
  ].join("\n");
  await fs.writeFile(path.join(DIGEST_DIR, "index.md"), md, "utf8");
}

function daysAgoISO(days: number): string {
  const d = new Date(Date.now() - days * 86400000);
  return d.toISOString().slice(0, 10);
}
