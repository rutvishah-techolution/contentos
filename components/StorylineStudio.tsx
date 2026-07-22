"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CHANNEL_LABELS, StorylineDoc } from "@/lib/storyline/types";

export default function StorylineStudio({
  slug,
  initialStorylines,
}: {
  slug: string;
  initialStorylines: StorylineDoc[];
}) {
  const router = useRouter();
  const [docs, setDocs] = useState<StorylineDoc[]>(initialStorylines);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${slug}/storylines`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setDocs(data.storylines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setGenerating(false);
    }
  }

  function updateDoc(updated: StorylineDoc) {
    setDocs((cur) =>
      cur.map((d) => (d.channel === updated.channel ? updated : d)),
    );
    router.refresh();
  }

  const allApproved = docs.length > 0 && docs.every((d) => d.approved);

  if (docs.length === 0) {
    return (
      <section className="card">
        <h2 className="text-sm font-medium text-fg">Storylines</h2>
        <p className="mt-1 text-xs text-faint">
          Generate a storyline for each approved piece — villain → hero, in each
          persona&rsquo;s voice, grounded in your research.
        </p>
        <button className="btn-primary mt-3" onClick={generate} disabled={generating}>
          {generating ? "Generating storylines…" : "Generate storylines"}
        </button>
        {error && <p className="alert-error mt-3">{error}</p>}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">Storylines</h2>
        <button
          className="text-xs text-faint hover:text-fg"
          onClick={generate}
          disabled={generating}
        >
          {generating ? "Regenerating…" : "↻ Regenerate all"}
        </button>
      </div>
      {error && <p className="alert-error">{error}</p>}
      {docs.map((doc) => (
        <StorylineCard
          key={doc.channel}
          slug={slug}
          doc={doc}
          onUpdate={updateDoc}
        />
      ))}
      {allApproved && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <span className="text-ok">✓</span>
            <span className="text-fg">All storylines approved.</span>
          </span>
          <a href={`/campaigns/${slug}/content`} className="btn-primary">
            Continue to drafting →
          </a>
        </div>
      )}
    </div>
  );
}

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
  const [busy, setBusy] = useState<null | "revise" | "approve">(null);
  const s = doc.storyline;

  async function revise() {
    if (!msg.trim()) return;
    setBusy("revise");
    try {
      const res = await fetch(
        `/api/campaigns/${slug}/storylines/${doc.channel}/revise`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.storyline);
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
        `/api/campaigns/${slug}/storylines/${doc.channel}/approve`,
        { method: "POST" },
      );
      if (res.ok) onUpdate({ ...doc, approved: true });
    } finally {
      setBusy(null);
    }
  }

  const beats: [string, string][] = [
    ["Hook", s.hook],
    ["Villain", s.villain],
    ["Shift", s.shift],
    ["Hero", s.hero],
    ["Proof", s.proof],
    ["Learning", s.learning],
    ["CTA", s.cta],
  ];

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <span className="badge">{CHANNEL_LABELS[doc.channel]}</span>
        <span className="flex items-center gap-2 text-xs text-faint">
          {doc.personaName}
          {doc.approved && <span className="text-ok">✓ approved</span>}
        </span>
      </div>
      <h3 className="text-[15px] font-semibold text-fg">{s.headline}</h3>

      <dl className="mt-3 flex flex-col gap-2">
        {beats.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[80px_1fr] gap-2">
            <dt className="text-xs font-medium text-faint">{k}</dt>
            <dd className="text-sm text-muted">{v}</dd>
          </div>
        ))}
      </dl>

      {/* chat-with-memory revision */}
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

      <div className="mt-3 flex flex-col gap-2">
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Tell it what to change — it remembers the conversation. e.g. 'sharpen the villain, make the hook less generic'"
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
          <button
            className="btn-primary"
            onClick={approve}
            disabled={busy !== null}
          >
            {busy === "approve" ? "Approving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
