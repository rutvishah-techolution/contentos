"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CHANNEL_LABELS } from "@/lib/storyline/types";
import type { DraftDoc, DraftStage } from "@/lib/draft/draft";

const STAGES: DraftStage[] = ["draft1", "draft2", "final"];
const STAGE_LABEL: Record<DraftStage, string> = {
  draft1: "Draft 1",
  draft2: "Draft 2",
  final: "Final",
};
const ADVANCE_LABEL: Record<string, string> = {
  draft1: "Refine to Draft 2 →",
  draft2: "Polish to Final →",
};

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
  const [openId, setOpenId] = useState<string | null>(null);

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

  const open = drafts.find((d) => d.id === openId) || null;
  const allApproved = drafts.length > 0 && drafts.every((d) => d.approved);

  if (drafts.length === 0) {
    return (
      <section className="card">
        <h2 className="text-sm font-medium text-fg">Draft the copy</h2>
        <p className="mt-1 text-xs text-faint">
          Each approved storyline is written into Draft 1. You review it, then step
          it forward: Draft 1 → Draft 2 → Final — approving each stage. Grounded only
          in your research.
        </p>
        <button className="btn-primary mt-3" onClick={generate} disabled={busy}>
          {busy ? "Writing Draft 1… (takes a minute)" : "Write Draft 1"}
        </button>
        {error && <p className="alert-error mt-3">{error}</p>}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">Drafts ({drafts.length})</h2>
        {allApproved && (
          <span className="text-xs text-ok">✓ all copy approved — ready to ship</span>
        )}
      </div>
      {error && <p className="alert-error">{error}</p>}
      {drafts.map((d) => (
        <button
          key={d.id}
          onClick={() => setOpenId(d.id)}
          className="card flex items-center justify-between gap-3 text-left transition hover:border-border-strong"
        >
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="badge">{CHANNEL_LABELS[d.channel]}</span>
              <span className="text-xs text-faint">{STAGE_LABEL[d.stage]}</span>
              {d.approved && <span className="text-xs text-ok">✓ approved</span>}
            </span>
            <span className="mt-1.5 block truncate text-sm text-fg">
              {firstLine(d.content)}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-3 text-xs">
            <FactBadge d={d} />
            <span className="text-muted">Open →</span>
          </span>
        </button>
      ))}

      {open && (
        <DraftFullscreen
          slug={slug}
          draft={open}
          onClose={() => setOpenId(null)}
          onUpdate={update}
        />
      )}
    </div>
  );
}

function firstLine(md: string): string {
  const line = md.split("\n").find((l) => l.trim().length > 0) || "";
  return line.replace(/^#+\s*/, "").slice(0, 90);
}

function FactBadge({ d }: { d: DraftDoc }) {
  const ft = d.factTrace;
  const clean = ft.untraced.length === 0;
  return (
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
          ? `✓ ${ft.traced}/${ft.total} traced`
          : `⚠ ${ft.untraced.length} untraced`}
    </span>
  );
}

function DraftFullscreen({
  slug,
  draft,
  onClose,
  onUpdate,
}: {
  slug: string;
  draft: DraftDoc;
  onClose: () => void;
  onUpdate: (d: DraftDoc) => void;
}) {
  const [busy, setBusy] = useState<null | "advance" | "approve" | "save" | "assist">(
    null,
  );
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(draft.content);
  const [viewStage, setViewStage] = useState<DraftStage>(draft.stage);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isCurrent = viewStage === draft.stage;
  const shownContent = isCurrent
    ? draft.content
    : draft.drafts[viewStage] ?? draft.content;
  const ft = draft.factTrace;
  const clean = ft.untraced.length === 0;

  async function call(
    kind: "advance" | "approve" | "save" | "assist",
    url: string,
    body?: object,
  ) {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function advance() {
    const data = await call("advance", `/api/campaigns/${slug}/drafts/${draft.id}/advance`);
    if (data) {
      onUpdate(data.draft);
      setViewStage(data.draft.stage);
      setEditText(data.draft.content);
      setEditing(false);
    }
  }
  async function approve() {
    const data = await call("approve", `/api/campaigns/${slug}/drafts/${draft.id}/approve`);
    if (data) onUpdate({ ...draft, approved: true });
  }
  async function save() {
    const data = await call("save", `/api/campaigns/${slug}/drafts/${draft.id}/edit`, {
      content: editText,
    });
    if (data) {
      onUpdate(data.draft);
      setEditing(false);
    }
  }
  async function assist() {
    if (!msg.trim()) return;
    const data = await call("assist", `/api/campaigns/${slug}/drafts/${draft.id}/assist`, {
      message: msg,
    });
    if (data) {
      onUpdate(data.draft);
      setEditText(data.draft.content);
      setMsg("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-bg">
      {/* left — Gemini assistant */}
      <aside className="flex w-[360px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <div className="text-sm font-medium text-fg">Assistant</div>
          <div className="text-xs text-faint">
            Fact-check figures, ask questions, or ask for an edit · Gemini
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {draft.chat.length === 0 ? (
            <p className="text-xs text-faint">
              Try: “Is the $50M biotech figure in our research?” · “Tighten the
              opening” · “What sources back the ROI claim?”
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {draft.chat.map((m, i) => (
                <div key={i} className="text-sm">
                  <div className="mb-0.5 text-xs text-faint">
                    {m.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div className={m.role === "user" ? "text-fg" : "text-muted"}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border p-3">
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Ask the assistant…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) assist();
            }}
          />
          <button
            className="btn-primary mt-2 w-full"
            onClick={assist}
            disabled={busy !== null || !msg.trim()}
          >
            {busy === "assist" ? "Thinking…" : "Send"}
          </button>
        </div>
      </aside>

      {/* main — the draft */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="badge">{CHANNEL_LABELS[draft.channel]}</span>
            <span className="text-xs text-faint">{draft.personaName}</span>
          </div>
          {/* stage stepper */}
          <div className="flex items-center gap-1 text-xs">
            {STAGES.map((s, i) => {
              const reached = STAGES.indexOf(draft.stage) >= i;
              const active = viewStage === s;
              return (
                <span key={s} className="flex items-center gap-1">
                  <button
                    disabled={!reached}
                    onClick={() => setViewStage(s)}
                    className={`rounded-md px-2 py-1 transition ${
                      active
                        ? "bg-surface-2 font-medium text-fg"
                        : reached
                          ? "text-muted hover:text-fg"
                          : "text-faint/50"
                    }`}
                  >
                    {STAGE_LABEL[s]}
                  </button>
                  {i < STAGES.length - 1 && <span className="text-faint">→</span>}
                </span>
              );
            })}
          </div>
          <button onClick={onClose} className="text-sm text-muted hover:text-fg">
            ✕ Close
          </button>
        </header>

        {!clean && isCurrent && (
          <p className="alert-error mx-6 mt-3">
            Figures not found in the research (verify before publishing):{" "}
            {ft.untraced.join(", ")}
          </p>
        )}
        {!isCurrent && (
          <p className="mx-6 mt-3 text-xs text-faint">
            Viewing {STAGE_LABEL[viewStage]} (earlier snapshot, read-only). Switch to{" "}
            {STAGE_LABEL[draft.stage]} to edit or continue.
          </p>
        )}
        {error && <p className="alert-error mx-6 mt-3">{error}</p>}

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-2xl">
            {editing && isCurrent ? (
              <textarea
                className="input min-h-[60vh] w-full resize-y font-mono text-sm"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            ) : (
              <article className="md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {shownContent}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>

        {/* action bar */}
        <footer className="flex items-center justify-between gap-3 border-t border-border px-6 py-3">
          <div className="flex items-center gap-3 text-xs">
            <FactBadge d={draft} />
            {draft.approved && <span className="text-ok">✓ approved</span>}
          </div>
          <div className="flex items-center gap-2">
            {isCurrent &&
              (editing ? (
                <>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      setEditing(false);
                      setEditText(draft.content);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn-ghost" onClick={save} disabled={busy !== null}>
                    {busy === "save" ? "Saving…" : "Save edits"}
                  </button>
                </>
              ) : (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setEditText(draft.content);
                    setEditing(true);
                  }}
                >
                  Edit
                </button>
              ))}
            {isCurrent && !editing && draft.stage !== "final" && (
              <button className="btn-primary" onClick={advance} disabled={busy !== null}>
                {busy === "advance" ? "Working…" : ADVANCE_LABEL[draft.stage]}
              </button>
            )}
            {isCurrent && !editing && draft.stage === "final" && !draft.approved && (
              <button className="btn-primary" onClick={approve} disabled={busy !== null}>
                {busy === "approve" ? "Approving…" : "Approve final ✓"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
