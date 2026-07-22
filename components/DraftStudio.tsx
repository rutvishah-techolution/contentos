"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CHANNEL_LABELS } from "@/lib/storyline/types";
import type { DraftDoc } from "@/lib/draft/draft";

export default function DraftStudio({
  slug,
  initialDrafts,
}: {
  slug: string;
  initialDrafts: DraftDoc[];
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftDoc[]>(initialDrafts);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${slug}/drafts`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setDrafts(data.drafts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function update(d: DraftDoc) {
    setDrafts((cur) => cur.map((x) => (x.id === d.id ? d : x)));
    router.refresh();
  }

  const allApproved = drafts.length > 0 && drafts.every((d) => d.approved);

  if (drafts.length === 0) {
    return (
      <section className="card">
        <h2 className="text-sm font-medium text-fg">Final copy</h2>
        <p className="mt-1 text-xs text-faint">
          Write each approved storyline into final copy — 3-draft pipeline →
          humanizer → fact-trace check, grounded in your research.
        </p>
        <button className="btn-primary mt-3" onClick={generate} disabled={busy}>
          {busy ? "Writing copy… (this takes a minute)" : "Generate final copy"}
        </button>
        {error && <p className="alert-error mt-3">{error}</p>}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">Final copy</h2>
        <button
          className="text-xs text-faint hover:text-fg"
          onClick={generate}
          disabled={busy}
        >
          {busy ? "Regenerating…" : "↻ Regenerate all"}
        </button>
      </div>
      {error && <p className="alert-error">{error}</p>}
      {drafts.map((d) => (
        <DraftCard key={d.id} slug={slug} draft={d} onUpdate={update} />
      ))}
      {allApproved && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <span className="text-ok">✓</span>
          <span className="text-fg">All copy approved.</span>
          <span className="text-faint">Campaign ready to ship.</span>
        </div>
      )}
    </div>
  );
}

function DraftCard({
  slug,
  draft,
  onUpdate,
}: {
  slug: string;
  draft: DraftDoc;
  onUpdate: (d: DraftDoc) => void;
}) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<null | "revise" | "approve">(null);
  const ft = draft.factTrace;
  const clean = ft.untraced.length === 0;

  async function revise() {
    if (!msg.trim()) return;
    setBusy("revise");
    try {
      const res = await fetch(
        `/api/campaigns/${slug}/drafts/${draft.id}/revise`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.draft);
        setMsg("");
      }
    } finally {
      setBusy(null);
    }
  }

  async function approve() {
    setBusy("approve");
    try {
      const res = await fetch(
        `/api/campaigns/${slug}/drafts/${draft.id}/approve`,
        { method: "POST" },
      );
      if (res.ok) onUpdate({ ...draft, approved: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <span className="badge">{CHANNEL_LABELS[draft.channel]}</span>
        <span className="flex items-center gap-3 text-xs">
          <span
            title={
              clean
                ? "Every figure traces to the research"
                : `Not found in research: ${ft.untraced.join(", ")}`
            }
            className={clean ? "text-ok" : "text-warn"}
          >
            {ft.total === 0
              ? "no figures"
              : clean
                ? `✓ ${ft.traced}/${ft.total} facts traced`
                : `⚠ ${ft.untraced.length} untraced`}
          </span>
          <span className="text-faint">{draft.personaName}</span>
          {draft.approved && <span className="text-ok">✓ approved</span>}
        </span>
      </div>

      {!clean && (
        <p className="alert-error mb-3">
          Figures not found in the research (verify before publishing):{" "}
          {ft.untraced.join(", ")}
        </p>
      )}

      <div className="md rounded-lg border border-border bg-surface-2 p-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.copy}</ReactMarkdown>
      </div>

      {draft.chat.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {draft.chat.map((m, i) => (
            <div
              key={i}
              className={`text-sm ${m.role === "user" ? "text-fg" : "text-muted"}`}
            >
              <span className="text-xs text-faint">
                {m.role === "user" ? "You" : draft.personaName}:{" "}
              </span>
              {m.content}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Revise it — it remembers the conversation. e.g. 'tighten the intro, make the CTA less salesy'"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <div className="flex gap-2 self-end">
          <button
            className="btn-ghost"
            onClick={revise}
            disabled={busy !== null || !msg.trim()}
          >
            {busy === "revise" ? "Revising…" : "Send"}
          </button>
          <button className="btn-primary" onClick={approve} disabled={busy !== null}>
            {busy === "approve" ? "Approving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
