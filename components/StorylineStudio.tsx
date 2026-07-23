"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CHANNEL_LABELS, Storyline, StorylineDoc } from "@/lib/storyline/types";
import { KindPill } from "@/components/TopicPlanner";

export default function StorylineStudio({
  slug,
  storylines,
}: {
  slug: string;
  storylines: StorylineDoc[];
}) {
  const [docs, setDocs] = useState<StorylineDoc[]>(storylines);
  const router = useRouter();

  // keep in sync when the server re-renders (e.g. after producing more)
  useEffect(() => setDocs(storylines), [storylines]);

  function update(d: StorylineDoc) {
    setDocs((cur) => cur.map((x) => (x.id === d.id ? d : x)));
    router.refresh();
  }

  const approvedCount = docs.filter((d) => d.approved).length;

  if (docs.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-muted">
        Storylines ({docs.length})
      </h2>
      {docs.map((d) => (
        <StorylineCard key={d.id} slug={slug} doc={d} onUpdate={update} />
      ))}
      {approvedCount > 0 && (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm shadow-lg shadow-black/5">
          <span className="flex items-center gap-2">
            <span className="text-ok">✓</span>
            <span className="text-fg">
              {approvedCount} of {docs.length} storyline
              {docs.length > 1 ? "s" : ""} approved.
            </span>
          </span>
          <a href={`/campaigns/${slug}/content`} className="btn-primary">
            Continue to drafting ({approvedCount}) →
          </a>
        </div>
      )}
    </div>
  );
}

const BEATS: (keyof Storyline)[] = [
  "hook",
  "villain",
  "shift",
  "hero",
  "proof",
  "learning",
  "cta",
];

function StorylineCard({
  slug,
  doc,
  onUpdate,
}: {
  slug: string;
  doc: StorylineDoc;
  onUpdate: (d: StorylineDoc) => void;
}) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<null | "revise" | "approve" | "edit">(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Storyline>(doc.storyline);
  const s = doc.storyline;

  async function revise() {
    if (!msg.trim()) return;
    setBusy("revise");
    try {
      const res = await fetch(`/api/campaigns/${slug}/storylines/${doc.id}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.storyline);
        setMsg("");
      }
    } finally {
      setBusy(null);
    }
  }

  async function saveEdit() {
    setBusy("edit");
    try {
      const res = await fetch(`/api/campaigns/${slug}/storylines/${doc.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch: draft }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.storyline);
        setEditing(false);
      }
    } finally {
      setBusy(null);
    }
  }

  async function toggleApprove() {
    const next = !doc.approved;
    setBusy("approve");
    try {
      const res = await fetch(`/api/campaigns/${slug}/storylines/${doc.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: next }),
      });
      if (res.ok) onUpdate({ ...doc, approved: next });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={`card ${doc.approved ? "approved-card" : ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="badge">{CHANNEL_LABELS[doc.channel]}</span>
          <KindPill kind={doc.kind} />
        </span>
        <span className="flex items-center gap-2 text-xs text-faint">
          {doc.personaName}
          {doc.approved && <span className="text-ok">✓ approved</span>}
        </span>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            className="input"
            value={draft.headline}
            onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
          />
          {BEATS.map((k) => (
            <div key={k} className="grid grid-cols-[80px_1fr] items-start gap-2">
              <span className="pt-2 text-xs font-medium capitalize text-faint">
                {k}
              </span>
              <textarea
                className="input resize-none"
                rows={2}
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </div>
          ))}
          <div className="flex gap-2 self-end">
            <button className="btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={saveEdit} disabled={busy !== null}>
              {busy === "edit" ? "Saving…" : "Save edits"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-fg">{s.headline}</h3>
            <button
              className="shrink-0 text-xs text-faint hover:text-fg"
              onClick={() => {
                setDraft(doc.storyline);
                setEditing(true);
              }}
            >
              Edit
            </button>
          </div>
          <dl className="mt-3 flex flex-col gap-2">
            {BEATS.map((k) => (
              <div key={k} className="grid grid-cols-[80px_1fr] gap-2">
                <dt className="text-xs font-medium capitalize text-faint">{k}</dt>
                <dd className="text-sm text-muted">{s[k]}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {doc.chat.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
          {doc.chat.map((m, i) => (
            <div
              key={i}
              className={`text-sm ${m.role === "user" ? "text-fg" : "text-muted"}`}
            >
              <span className="text-xs text-faint">
                {m.role === "user" ? "You" : doc.personaName}:{" "}
              </span>
              {m.content}
            </div>
          ))}
        </div>
      )}

      {!editing && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Chat to revise — it remembers the conversation. Or use Edit above to change it yourself."
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
            {doc.approved ? (
              <button
                className="btn-ghost"
                onClick={toggleApprove}
                disabled={busy !== null}
                title="Undo approval — puts it back to draft"
              >
                {busy === "approve" ? "Updating…" : "✓ Approved · Undo"}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={toggleApprove}
                disabled={busy !== null}
              >
                {busy === "approve" ? "Approving…" : "Approve"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
