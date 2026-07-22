import { Campaign, PersonaFile } from "@/lib/brain";
import { DigestItem, getRelevantDigest } from "@/lib/integrations/digest";
import { readPersonaBody } from "@/lib/brain";
import { callModel, normalizeModel } from "@/lib/models/router";

const POOL_SIZE = 60; // shared pool of relevant, recent verified articles
const PICK_BUDGET = 6; // max articles each persona may claim
const MIN_PICKS = 4; // floor: every persona always leaves with at least this many

export interface SelectionResult {
  /** personaId → the digest articles that persona claimed (no overlap) */
  assignments: Map<string, DigestItem[]>;
  poolSize: number;
}

/**
 * Round-robin article selection. Personas autonomously pick the digest articles
 * they want to write about — in character — and each pick is removed from the
 * pool so no two personas get the same article. Priority order rotates so no
 * persona is always first.
 */
export async function selectArticles(
  campaign: Campaign,
  personas: PersonaFile[],
): Promise<SelectionResult> {
  const pool = await getRelevantDigest(campaign.topic, POOL_SIZE);
  const assignments = new Map<string, DigestItem[]>();
  personas.forEach((p) => assignments.set(p.id, []));

  if (pool.length === 0) return { assignments, poolSize: 0 };

  const taken = new Set<string>();
  const order = rotate(personas);

  // Sequential picking with rotating priority: each persona picks from
  // whatever remains, so earlier picks are simply unavailable to later ones.
  for (const persona of order) {
    const available = pool.filter((a) => !taken.has(a.url));
    if (available.length === 0) break;
    const picks = await pickForPersona(campaign, persona, available);
    for (const a of picks) taken.add(a.url);
    assignments.set(persona.id, picks);
  }

  return { assignments, poolSize: pool.length };
}

/** Asks one persona which articles it wants (in character). */
async function pickForPersona(
  campaign: Campaign,
  persona: PersonaFile,
  available: DigestItem[],
): Promise<DigestItem[]> {
  const body = await readPersonaBody(persona.path);
  const list = available
    .map(
      (a, i) =>
        `[${i}] ${a.headline} — ${a.summary.slice(0, 180)} (${a.source}, ${a.date})`,
    )
    .join("\n");

  const system = `${body}

────────────────────────────────────────
You are choosing which of today's news articles YOU want to write about — as this exact persona. Pick only what genuinely fits your personality, expertise, and what matters to your readers. Range widely: a story from another field can still matter to you if it connects to your world.`;

  const user = `CAMPAIGN TOPIC: ${campaign.topic}
OBJECTIVE: ${campaign.objective}

AVAILABLE ARTICLES:
${list}

Pick between ${MIN_PICKS} and ${PICK_BUDGET} articles you most want to write about — lead with the ones that fit you best.
Return ONLY JSON: {"picks":[<article numbers>]}`;

  let idxs: number[] = [];
  try {
    const raw = await callModel(normalizeModel(persona.model), {
      system,
      user,
      maxTokens: 512,
      webSearch: false,
    });
    idxs = parsePicks(raw, available.length);
  } catch {
    idxs = []; // a failed pick falls through to the fill below
  }

  // Guarantee the floor: top up from the most-relevant remaining articles
  // (the pool is relevance-sorted) so every persona always leaves with MIN_PICKS.
  const chosen: number[] = [];
  const seen = new Set<number>();
  const add = (i: number) => {
    if (!seen.has(i)) {
      seen.add(i);
      chosen.push(i);
    }
  };
  idxs.forEach(add);
  for (let i = 0; i < available.length && chosen.length < MIN_PICKS; i++) add(i);

  return chosen.slice(0, PICK_BUDGET).map((i) => available[i]);
}

function parsePicks(text: string, max: number): number[] {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return [];
  try {
    const obj = JSON.parse(m[0]) as { picks?: unknown };
    if (!Array.isArray(obj.picks)) return [];
    const seen = new Set<number>();
    const out: number[] = [];
    for (const p of obj.picks) {
      const n = Number(p);
      if (Number.isInteger(n) && n >= 0 && n < max && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Rotates priority order by day so no persona is permanently first. */
function rotate(personas: PersonaFile[]): PersonaFile[] {
  if (personas.length === 0) return personas;
  const offset = new Date().getDate() % personas.length;
  return [...personas.slice(offset), ...personas.slice(0, offset)];
}
