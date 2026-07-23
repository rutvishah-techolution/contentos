import type { ChatMsg } from "@/lib/storyline/types";
import type { SourceTier } from "@/lib/research/verify";
import type { FactTrace } from "@/lib/draft/draft";

export type TimeSensitivity = "breaking" | "this-week" | "evergreen";
export type Recommendation = "post-now" | "consider" | "skip";
export type SignalStatus = "new" | "drafted" | "approved" | "dismissed";

/** A monitored topic the engine actively searches for news on. */
export interface Beat {
  id: string;
  label: string;
  query: string; // how it's phrased to the search
  active: boolean;
}

export interface NewsDraft {
  content: string;
  factTrace: FactTrace;
  chat: ChatMsg[]; // Gemini help-assistant, same as campaign drafts
  approved: boolean;
}

/** One judged, source-checked news item — the unit the feed shows. */
export interface Signal {
  id: string;
  beatId: string;
  beatLabel: string;
  headline: string;
  summary: string;
  url: string; // resolved, source-checked
  source: string; // publisher domain
  tier: SourceTier;
  publishedAt: string; // best-effort YYYY-MM-DD or ""
  timeSensitivity: TimeSensitivity;
  relevance: number; // 0-100
  angleStrength: number; // 0-100
  priority: number; // 0-100 (drives the ranking)
  recommendation: Recommendation;
  why: string; // why post now / why skip
  suggestedAngle: string;
  personaId: string;
  personaName: string;
  draft?: NewsDraft;
  status: SignalStatus;
  scannedAt: string;
}

export const TS_LABEL: Record<TimeSensitivity, string> = {
  breaking: "Breaking",
  "this-week": "This week",
  evergreen: "Evergreen",
};
export const REC_LABEL: Record<Recommendation, string> = {
  "post-now": "Post now",
  consider: "Consider",
  skip: "Skip",
};
