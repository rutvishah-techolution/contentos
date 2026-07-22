export type Stream = "campaign" | "scout";

/** A single researched claim, structured so it is auditable and citable. */
export interface Finding {
  claim: string;
  evidence: string; // specific figure / named company / date
  sourceUrl: string; // real, resolvable URL
  sourceTitle?: string; // the cited article's title (from the model)
  whyItMatters: string; // through this persona's lens
}

/** One persona's full research output for a campaign. */
export interface PersonaResearch {
  personaId: string;
  personaName: string;
  stream: Stream;
  model: string;
  summary: string; // short synthesis in the persona's voice
  findings: Finding[];
  error?: string; // set if this persona failed (others still proceed)
  generatedAt: string;
}

// ── Source-check ─────────────────────────────────────────────────────────────
export type Decision = "VERIFIED" | "STRIP" | "FLAG";

/** The source-check's ruling on a single claim. */
export interface Verdict {
  personaId: string;
  personaName: string;
  claim: string;
  evidence: string;
  sourceUrl: string;
  sourceTitle?: string;
  resolvedSource: string;
  decision: Decision;
  reason: string;
}

export interface StreamValidation {
  stream: Stream;
  verified: number;
  flagged: number;
  stripped: number;
  verdicts: Verdict[];
}

export interface SourceCheckResult {
  campaign: StreamValidation;
  scout: StreamValidation;
}
