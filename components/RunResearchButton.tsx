"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "idle" | "researching" | "checking";

export default function RunResearchButton({
  slug,
  personaNames,
  hasResearch,
}: {
  slug: string;
  personaNames: string[];
  hasResearch: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const running = phase !== "idle";

  async function run() {
    setError(null);
    try {
      setPhase("researching");
      const r1 = await fetch(`/api/campaigns/${slug}/research`, {
        method: "POST",
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1.error || "Research failed.");

      setPhase("checking");
      const r2 = await fetch(`/api/campaigns/${slug}/source-check`, {
        method: "POST",
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error || "Source-check failed.");

      router.push(`/campaigns/${slug}/research`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("idle");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={run} disabled={running}>
          {running ? (
            <>
              <Spinner />
              {phase === "researching"
                ? `Researching… ${personaNames.length} personas in parallel`
                : "Fact-checking sources…"}
            </>
          ) : hasResearch ? (
            "Re-run Market Research"
          ) : (
            "Run Market Research"
          )}
        </button>
        {hasResearch && !running && (
          <button
            className="btn-ghost"
            onClick={() => router.push(`/campaigns/${slug}/research`)}
          >
            View research →
          </button>
        )}
      </div>

      {running && (
        <p className="text-xs text-faint">
          {phase === "researching"
            ? "Each persona is web-searching and reasoning in character."
            : "Opening every cited source, following redirects, and validating claims."}
        </p>
      )}

      {error && <p className="alert-error">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}
