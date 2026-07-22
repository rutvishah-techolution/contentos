import { callClaude } from "@/lib/models/claude";

export type SourceTier = "primary" | "reputable" | "weak";

// ── Figure extraction ────────────────────────────────────────────────────────
export interface Figure {
  label: string; // canonical, for reasons/logs
  variants: string[]; // lowercase strings to search for in page text
}

/**
 * Pulls the hard, checkable figures out of a claim (percentages, money, multiples,
 * comma-numbers). These are the anchors we search for in the source text.
 */
export function extractFigures(text: string): Figure[] {
  const figures: Figure[] = [];
  const seen = new Set<string>();
  const add = (label: string, variants: string[]) => {
    if (seen.has(label)) return;
    seen.add(label);
    figures.push({ label, variants: variants.map((v) => v.toLowerCase()) });
  };

  // percentages: 95%, 95 percent
  for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*(?:%|percent|per cent)/gi)) {
    const n = m[1];
    add(`${n}%`, [`${n}%`, `${n} percent`, `${n} per cent`]);
  }
  // money / scale: $30 billion, $2.85B, 30 billion, $100K
  const NORM: Record<string, string> = {
    bn: "billion", b: "billion", m: "million", mn: "million",
    k: "thousand", t: "trillion", tn: "trillion",
  };
  const SHORTS: Record<string, string[]> = {
    billion: ["b", "bn"], million: ["m", "mn"], thousand: ["k"], trillion: ["t", "tn"],
  };
  for (const m of text.matchAll(
    /\$?\s?(\d+(?:\.\d+)?)\s*(billion|million|trillion|thousand|bn|mn|tn|b|m|k|t)\b/gi,
  )) {
    const n = m[1];
    const unit = m[2].toLowerCase();
    const long = NORM[unit] || unit; // billion/million/thousand/trillion
    const shorts = SHORTS[long] || [];
    const variants = [`${n} ${long}`, `$${n} ${long}`];
    for (const s of shorts) variants.push(`${n}${s}`, `$${n}${s}`);
    add(`$${n} ${long}`, variants);
  }
  // multipliers: 20x
  for (const m of text.matchAll(/\b(\d+(?:\.\d+)?)\s*x\b/gi)) {
    add(`${m[1]}x`, [`${m[1]}x`, `${m[1]} x`, `${m[1]}-fold`, `${m[1]} times`]);
  }
  // comma numbers: 24,000
  for (const m of text.matchAll(/\b(\d{1,3}(?:,\d{3})+)\b/g)) {
    const n = m[1];
    add(n, [n, n.replace(/,/g, "")]);
  }
  return figures;
}

/**
 * Looks for any of the claim's figures in the page text. Returns the sentence
 * around the first hit (for the AI context check), or null if none are present.
 */
export function findFigure(
  figures: Figure[],
  pageText: string,
): { figure: string; sentence: string } | null {
  const lower = pageText.toLowerCase();
  for (const fig of figures) {
    for (const v of fig.variants) {
      const idx = lower.indexOf(v);
      if (idx !== -1) {
        return { figure: fig.label, sentence: sentenceAround(pageText, idx) };
      }
    }
  }
  return null;
}

function sentenceAround(text: string, idx: number): string {
  const start = Math.max(0, text.lastIndexOf(".", idx - 1) + 1);
  let end = text.indexOf(".", idx);
  if (end === -1 || end - idx > 260) end = Math.min(text.length, idx + 200);
  return text.slice(start, end + 1).trim().replace(/\s+/g, " ").slice(0, 400);
}

// ── Source quality tier ──────────────────────────────────────────────────────
const PRIMARY = new Set([
  "mit.edu", "gartner.com", "mckinsey.com", "bcg.com", "deloitte.com",
  "pwc.com", "reuters.com", "bloomberg.com", "wsj.com", "ft.com", "hbr.org",
  "nature.com", "science.org", "arxiv.org", "sec.gov", "oecd.org", "imf.org",
  "weforum.org", "statista.com", "openai.com", "anthropic.com", "microsoft.com",
  "nvidia.com", "google.com", "deepmind.google", "aws.amazon.com",
]);
const REPUTABLE = new Set([
  "techcrunch.com", "wired.com", "theverge.com", "forbes.com", "cnbc.com",
  "axios.com", "theinformation.com", "businessinsider.com", "fortune.com",
  "venturebeat.com", "arstechnica.com", "zdnet.com", "theguardian.com",
  "nytimes.com", "economist.com", "fastcompany.com", "inc.com", "cio.com",
]);

export function sourceTier(url: string): SourceTier {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "weak";
  }
  if (PRIMARY.has(host) || host.endsWith(".gov") || host.endsWith(".edu"))
    return "primary";
  if (REPUTABLE.has(host)) return "reputable";
  return "weak";
}

// ── Batched AI context check (the only AI in verification) ───────────────────
export interface ContextItem {
  index: number;
  claim: string;
  sentence: string;
}

/**
 * One cheap call: for each (claim, matched sentence), does the sentence actually
 * support the claim? Catches "number is on the page but about something else."
 */
export async function batchContextCheck(
  items: ContextItem[],
): Promise<Map<number, boolean>> {
  const out = new Map<number, boolean>();
  if (items.length === 0) return out;

  const system = `You verify whether a source sentence supports a claim. For each item, set "supports" true ONLY if the sentence clearly backs the claim's point and its number. If the number in the sentence is about something different, set false.
Return ONLY JSON: {"results":[{"index":0,"supports":true}]}`;
  const user = JSON.stringify(
    items.map((i) => ({ index: i.index, claim: i.claim, sentence: i.sentence })),
    null,
    2,
  );

  try {
    const raw = await callClaude({ system, user, maxTokens: 2048, webSearch: false });
    const m = raw.match(/\{[\s\S]*\}/);
    const parsed = m ? JSON.parse(m[0]) : null;
    const arr = parsed?.results;
    if (Array.isArray(arr)) {
      for (const r of arr) {
        const idx = Number(r.index);
        if (!Number.isNaN(idx)) out.set(idx, r.supports !== false);
      }
    }
  } catch {
    /* fall through: default handled by caller */
  }
  // default: figure was present, so lean supported unless told otherwise
  for (const it of items) if (!out.has(it.index)) out.set(it.index, true);
  return out;
}
