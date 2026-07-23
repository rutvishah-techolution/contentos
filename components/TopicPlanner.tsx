"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Channel,
  CHANNEL_LABELS,
  SELECTABLE_CHANNELS,
} from "@/lib/storyline/types";
import type { TopicBank, Topic } from "@/lib/storyline/topics";

const CHANNEL_ORDER: Channel[] = ["longform", "blog", "linkedin", "instagram"];

export default function TopicPlanner({
  slug,
  initialBank,
  personas,
}: {
  slug: string;
  initialBank: TopicBank | null;
  personas: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [bank, setBank] = useState<TopicBank | null>(initialBank);
  const [channels, setChannels] = useState<Channel[]>([...SELECTABLE_CHANNELS]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState<null | "gen" | "produce">(null);
  const [error, setError] = useState<string | null>(null);

  // sync when the server re-renders (e.g. topics flip to in-production)
  useEffect(() => setBank(initialBank), [initialBank]);

  const toggleChannel = (c: Channel) =>
    setChannels((cur) =>
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
    );
  const toggleSelect = (id: string) =>
    setSelected((cur) => {
      const n = new Set(cur);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  async function generate() {
    setBusy("gen");
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${slug}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels, feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setBank(data.bank);
      setFeedback("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function produce() {
    if (selected.size === 0) return;
    setBusy("produce");
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${slug}/storylines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicIds: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setSelected(new Set());
      router.refresh(); // storylines appear in the Studio below
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  const topics = bank?.topics || [];
  const available = topics.filter((t) => t.status === "available");

  return (
    <div className="flex flex-col gap-6">
      {/* channels + generate */}
      <section className="card">
        <h2 className="mb-1 text-sm font-medium text-fg">1 · Choose channels</h2>
        <p className="mb-3 text-xs text-faint">
          Longform is always included as the flagship. Pick the others.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-fg bg-surface-2 px-4 py-2 text-sm">
            ★ Longform (flagship)
          </span>
          {SELECTABLE_CHANNELS.map((c) => {
            const on = channels.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleChannel(c)}
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
        <button className="btn-primary mt-4" onClick={generate} disabled={busy !== null}>
          {busy === "gen"
            ? "Generating topics…"
            : bank
              ? "Generate more topics"
              : "Generate topics (4+ per channel)"}
        </button>
        {bank && (
          <div className="mt-3">
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional: steer the next batch — 'more on cost/governance, fewer generic ones'"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        )}
        {error && <p className="alert-error mt-3">{error}</p>}
      </section>

      {/* the shelf: topics grouped by channel */}
      {topics.length > 0 && (
        <section className="card">
          {bank?.spine && (
            <div className="mb-4 rounded-lg border border-border bg-surface-2 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-faint">
                Campaign spine
              </div>
              <div className="mt-1 text-sm text-fg">{bank.spine}</div>
            </div>
          )}
          <h2 className="mb-1 text-sm font-medium text-fg">
            2 · Pick the topics to produce
          </h2>
          <p className="mb-4 text-xs text-faint">
            Check the ones you want now. Unchecked topics stay on the shelf for
            later — nothing is wasted.
          </p>

          {CHANNEL_ORDER.map((c) => {
            const list = topics.filter((t) => t.channel === c);
            if (list.length === 0) return null;
            return (
              <div key={c} className="mb-5">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
                  {CHANNEL_LABELS[c]}
                </h3>
                <div className="flex flex-col gap-2">
                  {list.map((t) => (
                    <TopicRow
                      key={t.id}
                      slug={slug}
                      topic={t}
                      personas={personas}
                      checked={selected.has(t.id)}
                      onToggle={() => toggleSelect(t.id)}
                      onEdited={(b) => setBank(b)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-faint">
              {available.length} on the shelf · {selected.size} selected
            </span>
            <button
              className="btn-primary"
              onClick={produce}
              disabled={busy !== null || selected.size === 0}
            >
              {busy === "produce"
                ? "Creating storylines…"
                : `Create storylines for ${selected.size} selected →`}
            </button>
          </div>
          <p className="mt-2 text-right text-xs text-faint">
            Next: each becomes a villain→hero storyline you can chat-revise & approve.
          </p>
        </section>
      )}
    </div>
  );
}

function TopicRow({
  slug,
  topic,
  personas,
  checked,
  onToggle,
  onEdited,
}: {
  slug: string;
  topic: Topic;
  personas: { id: string; name: string }[];
  checked: boolean;
  onToggle: () => void;
  onEdited: (bank: TopicBank) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState(topic.headline);
  const [angle, setAngle] = useState(topic.angle);
  const [personaId, setPersonaId] = useState(topic.personaId);
  const [saving, setSaving] = useState(false);
  const inProd = topic.status === "in-production";

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${slug}/topics/${topic.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch: { headline, angle, personaId } }),
      });
      const data = await res.json();
      if (res.ok) {
        onEdited(data.bank);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-border-strong bg-surface-2 p-3">
        <input
          className="input mb-2"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
        <textarea
          className="input mb-2 resize-none"
          rows={2}
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
        />
        <select
          className="input mb-2"
          value={personaId}
          onChange={(e) => setPersonaId(e.target.value)}
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="btn-ghost" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
        checked ? "border-fg bg-surface-2" : "border-border hover:border-border-strong"
      } ${inProd ? "opacity-60" : ""}`}
    >
      <input
        type="checkbox"
        className="mt-1"
        checked={checked}
        disabled={inProd}
        onChange={onToggle}
      />
      <span className="flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-fg">{topic.headline}</span>
          <span className="shrink-0 text-xs text-faint">{topic.personaName}</span>
        </span>
        <span className="mt-0.5 block text-xs text-muted">{topic.angle}</span>
        <span className="mt-1 flex items-center gap-3">
          {inProd ? (
            <span className="text-xs text-ok">✓ in production</span>
          ) : (
            <button
              type="button"
              className="text-xs text-faint hover:text-fg"
              onClick={(e) => {
                e.preventDefault();
                setEditing(true);
              }}
            >
              Edit
            </button>
          )}
        </span>
      </span>
    </label>
  );
}
