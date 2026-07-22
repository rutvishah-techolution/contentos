"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Channel,
  CHANNEL_LABELS,
  ContentPlan,
} from "@/lib/storyline/types";

const ALL: Channel[] = ["blog", "linkedin", "instagram"];

export default function StorylinePlanner({
  slug,
  initialPlan,
}: {
  slug: string;
  initialPlan: ContentPlan | null;
}) {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>(ALL);
  const [plan, setPlan] = useState<ContentPlan | null>(initialPlan);
  const [busy, setBusy] = useState<null | "gen" | "approve">(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggle = (c: Channel) =>
    setChannels((cur) =>
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
    );

  async function generate() {
    if (channels.length === 0) return;
    setBusy("gen");
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${slug}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels, feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setPlan(data.plan);
      setFeedback("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function approve() {
    setBusy("approve");
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${slug}/plan/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve.");
      setPlan((p) => (p ? { ...p, approved: true } : p));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* channel selection */}
      <section className="card">
        <h2 className="mb-3 text-sm font-medium text-muted">Channels</h2>
        <div className="flex flex-wrap gap-2">
          {ALL.map((c) => {
            const on = channels.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  on
                    ? "border-fg bg-surface-2 text-fg"
                    : "border-border text-muted hover:border-border-strong"
                }`}
              >
                {on ? "✓ " : ""}
                {CHANNEL_LABELS[c]}
              </button>
            );
          })}
        </div>
        <button
          className="btn-primary mt-4"
          onClick={generate}
          disabled={busy !== null || channels.length === 0}
        >
          {busy === "gen"
            ? "Planning…"
            : plan
              ? "Regenerate plan"
              : "Generate content plan"}
        </button>
        {busy === "gen" && (
          <p className="mt-2 text-xs text-faint">
            Proposing a spine + one distinct angle per channel, grounded in your
            approved research.
          </p>
        )}
      </section>

      {error && <p className="alert-error">{error}</p>}

      {/* the plan */}
      {plan && (
        <>
          <section className="card">
            <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-faint">
              Campaign spine
            </h2>
            <p className="text-[15px] font-medium text-fg">{plan.spine}</p>
          </section>

          <div className="flex flex-col gap-3">
            {plan.items.map((it, i) => (
              <div key={i} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <span className="badge">{CHANNEL_LABELS[it.channel]}</span>
                  <span className="text-xs text-faint">{it.personaName}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-fg">
                  {it.headline}
                </h3>
                <p className="mt-1.5 text-sm text-muted">
                  <span className="text-faint">Angle: </span>
                  {it.angle}
                </p>
                <p className="mt-1 text-xs text-faint">{it.rationale}</p>
              </div>
            ))}
          </div>

          {/* review gate */}
          {plan.approved ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
              <span className="text-ok">✓</span>
              <span className="text-fg">Plan approved.</span>
              <span className="text-faint">
                Storyline generation for each piece comes next.
              </span>
            </div>
          ) : (
            <section className="card">
              <h2 className="text-sm font-medium text-fg">Review the plan</h2>
              <p className="mt-1 text-xs text-faint">
                Approve it, or describe changes and regenerate (swap an angle,
                change a persona, different channel focus…).
              </p>
              <textarea
                className="input mt-3 resize-none"
                rows={2}
                placeholder="e.g. Make the LinkedIn angle about regulatory risk, and let the Auditor write the blog."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="mt-3 flex gap-2">
                <button
                  className="btn-ghost"
                  onClick={generate}
                  disabled={busy !== null || !feedback.trim()}
                >
                  {busy === "gen" ? "Regenerating…" : "Regenerate with changes"}
                </button>
                <button
                  className="btn-primary"
                  onClick={approve}
                  disabled={busy !== null}
                >
                  {busy === "approve" ? "Approving…" : "Approve plan"}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
