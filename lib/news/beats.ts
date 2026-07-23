import { Beat } from "@/lib/news/types";
import { loadBeats, saveBeats } from "@/lib/news/store";

/** Sensible starting beats for an enterprise-AI brand. Editable in the UI. */
const DEFAULT_BEATS: Omit<Beat, "id">[] = [
  {
    label: "Enterprise AI ROI & measurement",
    query: "enterprise AI ROI, measurable value, AI spend vs return, CFO",
    active: true,
  },
  {
    label: "AI governance, regulation & compliance",
    query: "AI regulation, governance, compliance, enterprise policy, EU/US AI rules",
    active: true,
  },
  {
    label: "AI in finance & the CFO office",
    query: "AI in finance teams, CFO, financial operations automation",
    active: true,
  },
  {
    label: "Enterprise automation & agentic AI",
    query: "enterprise automation, agentic AI, autonomous agents in production",
    active: true,
  },
  {
    label: "AI adoption, pilots & failures",
    query: "enterprise AI adoption, failed AI pilots, deployment lessons",
    active: true,
  },
];

function id(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "beat"
  );
}

/** Returns beats, seeding + persisting the defaults on first run. */
export async function getBeats(): Promise<Beat[]> {
  const existing = await loadBeats();
  if (existing && existing.length) return existing;
  const seeded: Beat[] = DEFAULT_BEATS.map((b) => ({ ...b, id: id(b.label) }));
  await saveBeats(seeded);
  return seeded;
}

export async function addBeat(label: string, query: string): Promise<Beat[]> {
  const beats = await getBeats();
  let bid = id(label);
  let n = 2;
  while (beats.some((b) => b.id === bid)) bid = `${id(label)}-${n++}`;
  beats.push({ id: bid, label, query: query || label, active: true });
  await saveBeats(beats);
  return beats;
}

export async function updateBeat(
  bid: string,
  patch: Partial<Pick<Beat, "label" | "query" | "active">>,
): Promise<Beat[]> {
  const beats = await getBeats();
  const next = beats.map((b) => (b.id === bid ? { ...b, ...patch } : b));
  await saveBeats(next);
  return next;
}

export async function deleteBeat(bid: string): Promise<Beat[]> {
  const beats = await getBeats();
  const next = beats.filter((b) => b.id !== bid);
  await saveBeats(next);
  return next;
}
