export type Channel =
  | "longform"
  | "blog"
  | "linkedin"
  | "carousel"
  | "instagram";

/** Channels the user can toggle. Longform is always included as the flagship. */
export const SELECTABLE_CHANNELS: Channel[] = [
  "blog",
  "linkedin",
  "carousel",
  "instagram",
];
export const ALL_CHANNELS: Channel[] = [
  "longform",
  "blog",
  "linkedin",
  "carousel",
  "instagram",
];

export const CHANNEL_LABELS: Record<Channel, string> = {
  longform: "Longform Article",
  blog: "Blog",
  linkedin: "LinkedIn",
  carousel: "LinkedIn Carousel",
  instagram: "Instagram",
};

/** Channel display order used across menus, banks, and workspace. */
export const CHANNEL_ORDER: Channel[] = [
  "longform",
  "blog",
  "linkedin",
  "carousel",
  "instagram",
];

/** Whether a piece pitches the service (campaign) or is pure POV (thought leadership). */
export type PieceKind = "campaign" | "thought-leadership";
export const KIND_LABEL: Record<PieceKind, string> = {
  campaign: "Campaign",
  "thought-leadership": "Thought leadership",
};

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
  kind: PieceKind;
  personaId: string;
  personaName: string;
  angle: string;
  headline: string;
  storyline: Storyline;
  chat: ChatMsg[];
  approved: boolean;
  generatedAt: string;
}
