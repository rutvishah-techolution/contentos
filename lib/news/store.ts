import { promises as fs } from "fs";
import path from "path";
import { BRAIN_DIR } from "@/lib/brain";
import { normalizeUrl } from "@/lib/integrations/digest";
import { Beat, Signal } from "@/lib/news/types";

export const NEWS_DIR = path.join(BRAIN_DIR, "news");
const BEATS_FILE = path.join(NEWS_DIR, "beats.json");
const SEEN_FILE = path.join(NEWS_DIR, "seen.json");
const signalPath = (id: string) => path.join(NEWS_DIR, `signal-${id}.md`);

async function ensureDir() {
  await fs.mkdir(NEWS_DIR, { recursive: true });
}

// ── beats ────────────────────────────────────────────────────────────────────
export async function loadBeats(): Promise<Beat[] | null> {
  try {
    return JSON.parse(await fs.readFile(BEATS_FILE, "utf8")) as Beat[];
  } catch {
    return null;
  }
}
export async function saveBeats(beats: Beat[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(BEATS_FILE, JSON.stringify(beats, null, 2), "utf8");
}

// ── seen-url ledger (dedup across scans) ─────────────────────────────────────
export async function readSeen(): Promise<Set<string>> {
  try {
    const arr = JSON.parse(await fs.readFile(SEEN_FILE, "utf8")) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}
export async function addSeen(urls: string[]): Promise<void> {
  await ensureDir();
  const seen = await readSeen();
  for (const u of urls) seen.add(normalizeUrl(u));
  // cap the ledger so it can't grow forever
  const arr = [...seen].slice(-2000);
  await fs.writeFile(SEEN_FILE, JSON.stringify(arr, null, 2), "utf8");
}

// ── signals ──────────────────────────────────────────────────────────────────
export async function writeSignal(s: Signal): Promise<void> {
  await ensureDir();
  const md = [
    "---",
    `id: ${s.id}`,
    `beat: ${s.beatLabel}`,
    `source: ${s.source}`,
    `tier: ${s.tier}`,
    `timeSensitivity: ${s.timeSensitivity}`,
    `recommendation: ${s.recommendation}`,
    `status: ${s.status}`,
    `scannedAt: ${s.scannedAt}`,
    "---",
    "",
    `# ${s.headline}`,
    "",
    `**Why:** ${s.why}`,
    "",
    `${s.summary}`,
    "",
    `Source: ${s.url}`,
    "",
    "## Data",
    "",
    "```json",
    JSON.stringify(s, null, 2),
    "```",
    "",
  ].join("\n");
  await fs.writeFile(signalPath(s.id), md, "utf8");
}

export async function readSignal(id: string): Promise<Signal | null> {
  try {
    const md = await fs.readFile(signalPath(id), "utf8");
    const block = md.match(/## Data\s*```json\s*([\s\S]*?)```/);
    return block ? (JSON.parse(block[1]) as Signal) : null;
  } catch {
    return null;
  }
}

export async function readSignals(): Promise<Signal[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(NEWS_DIR)).filter(
      (f) => f.startsWith("signal-") && f.endsWith(".md"),
    );
  } catch {
    return [];
  }
  const out: Signal[] = [];
  for (const f of files) {
    const s = await readSignal(f.replace(/^signal-/, "").replace(/\.md$/, ""));
    if (s) out.push(s);
  }
  // newest scan first, then by priority
  return out.sort(
    (a, b) =>
      b.scannedAt.localeCompare(a.scannedAt) || b.priority - a.priority,
  );
}
