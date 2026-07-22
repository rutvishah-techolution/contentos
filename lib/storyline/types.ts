export type Channel = "longform" | "blog" | "linkedin" | "instagram";

/** Channels the user can toggle. Longform is always included as the flagship. */
export const SELECTABLE_CHANNELS: Channel[] = ["blog", "linkedin", "instagram"];
export const ALL_CHANNELS: Channel[] = [
  "longform",
  "blog",
  "linkedin",
  "instagram",
];

export const CHANNEL_LABELS: Record<Channel, string> = {
  longform: "Longform Article",
  blog: "Blog",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};

/** One planned content piece: a distinct angle, a channel, and its author. */
export interface PlanItem {
  channel: Channel;
  personaId: string;
  personaName: string;
  angle: string; // the distinct angle/topic this piece takes
  headline: string; // proposed working headline
  rationale: string; // why this angle + persona for this channel
}

/** The campaign content plan: one shared spine + distinct pieces. */
export interface ContentPlan {
  spine: string; // the campaign's single core message
  items: PlanItem[];
  generatedAt: string;
  approved: boolean;
}

/** The narrative skeleton of one piece. */
export interface Storyline {
  headline: string;
  hook: string;
  villain: string;
  shift: string;
  hero: string;
  proof: string;
  learning: string;
  cta: string;
}

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

/** One piece's storyline + its revision chat (with memory). */
export interface StorylineDoc {
  id: string; // the piece id (= topic id)
  channel: Channel;
  personaId: string;
  personaName: string;
  angle: string;
  headline: string;
  storyline: Storyline;
  chat: ChatMsg[];
  approved: boolean;
  generatedAt: string;
}
