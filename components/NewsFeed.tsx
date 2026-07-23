"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Beat, Signal } from "@/lib/news/types";
import { TS_LABEL, REC_LABEL } from "@/lib/news/types";

export default function NewsFeed({
  initialBeats,
  initialSignals,
}: {
  initialBeats: Beat[];
  initialSignals: Signal[];
}) {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>(initialBeats);
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [scanning, setScanning] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBeats, setShowBeats] = useState(false);

  async function scan() {
    setScanning(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/news/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed.");
      setNote(
        `Found ${data.created} signal${data.created === 1 ? "" : "s"} · drafted ${data.drafted} · skipped ${data.skipped}.`,
      );
      router.refresh();
      if (Array.isArray(data.signals) && data.signals.length) {
        setSignals((cur) => [...data.signals, ...cur]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setScanning(false);
    }
  }

  function update(s: Signal) {
    setSignals((cur) => cur.map((x) => (x.id === s.id ? s : x)));
    router.refresh();
  }
  function remove(id: string) {
    setSignals((cur) => cur.filter((x) => x.id !== id));
    router.refresh();
  }

  const ranked = [...signals].sort((a, b) => b.priority - a.priority);

  return (
    <div className="flex flex-col gap-5">
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="text-xs text-faint hover:text-fg"
          onClick={() => setShowBeats((v) => !v)}
        >
          {showBeats ? "▾" : "▸"} Beats ({beats.filter((b) => b.active).length} active)
        </button>
        <button className="btn-primary" onClick={scan} disabled={scanning}>
          {scanning ? "Scanning… (this takes a minute)" : "Scan for news now"}
        </button>
      </div>
      {note && <p className="text-xs text-muted">{note}</p>}
      {error && <p className="alert-error">{error}</p>}

      {showBeats && <Beats beats={beats} onChange={setBeats} />}

      {/* feed */}
      {ranked.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-faint">
          No signals yet. Hit “Scan for news now” — it searches your beats, judges
          what&rsquo;s worth posting, and drafts the urgent ones.
        </p>
      ) : (
        ranked.map((s) => (
          <SignalCard key={s.id} signal={s} onUpdate={update} onRemove={remove} />
        ))
      )}
    </div>
  );
}

function Pill({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
        strong ? "border border-fg text-fg" : "border border-border bg-surface text-faint"
      }`}
    >
      {children}
    </span>
  );
}

function SignalCard({
  signal,
  onUpdate,
  onRemove,
}: {
  signal: Signal;
  onUpdate: (s: Signal) => void;
  onRemove: (id: string) => void;
}) {
  const [busy, setBusy] = useState<null | string>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(signal.draft?.content || "");

  async function call(kind: string, url: string, body?: object) {
    setBusy(kind);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      return data;
    } catch {
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function draft() {
    const d = await call("draft", `/api/news/${signal.id}/draft`);
    if (d?.signal) {
      onUpdate(d.signal);
      setText(d.signal.draft?.content || "");
      setOpen(true);
    }
  }
  async function toggleApprove() {
    const next = !signal.draft?.approved;
    const d = await call("approve", `/api/news/${signal.id}/approve`, { approved: next });
    if (d?.signal) onUpdate(d.signal);
  }
  async function save() {
    const d = await call("save", `/api/news/${signal.id}/edit`, { content: text });
    if (d?.signal) {
      onUpdate(d.signal);
      setEditing(false);
    }
  }
  async function dismiss() {
    if (!confirm("Dismiss this signal?")) return;
    const ok = await call("dismiss", `/api/news/${signal.id}/dismiss`);
    if (ok) onRemove(signal.id);
  }

  const approved = signal.draft?.approved;
  const ft = signal.draft?.factTrace;

  return (
    <div className={`card ${approved ? "approved-card" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Pill strong={signal.timeSensitivity === "breaking"}>
          {TS_LABEL[signal.timeSensitivity]}
        </Pill>
        <Pill strong={signal.recommendation === "post-now"}>
          {REC_LABEL[signal.recommendation]}
        </Pill>
        <span className="text-[11px] text-faint">{signal.beatLabel}</span>
        <span className="ml-auto text-[11px] text-faint">
          priority {signal.priority}
        </span>
      </div>

      <h3 className="text-[15px] font-semibold text-fg">{signal.headline}</h3>

      <p className="mt-1.5 text-sm text-muted">
        <span className="font-medium text-fg">Why:</span> {signal.why}
      </p>
      {signal.summary && (
        <p className="mt-1.5 text-sm text-muted">{signal.summary}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
        <a href={signal.url} target="_blank" rel="noreferrer" className="underline hover:text-fg">
          {signal.source || "source"}
        </a>
        <span>· {signal.tier}</span>
        {signal.publishedAt && <span>· {signal.publishedAt}</span>}
        <span>· {signal.personaName}</span>
        {signal.suggestedAngle && (
          <span className="w-full text-muted">Angle: {signal.suggestedAngle}</span>
        )}
      </div>

      {/* draft */}
      {signal.draft && open && (
        <div className="mt-3 border-t border-border pt-3">
          {ft && ft.untraced.length > 0 && (
            <p className="alert-error mb-2">
              Figures not found in the source: {ft.untraced.join(", ")}
            </p>
          )}
          {editing ? (
            <textarea
              className="input min-h-[220px] w-full resize-y font-mono text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <div className="md md-compact rounded-lg border border-border bg-surface-2 p-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {signal.draft.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* actions */}
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button className="text-xs text-faint hover:text-fg" onClick={dismiss}>
          Dismiss
        </button>
        {!signal.draft ? (
          <button className="btn-primary" onClick={draft} disabled={busy !== null}>
            {busy === "draft" ? "Drafting…" : "Draft this take"}
          </button>
        ) : (
          <>
            <button
              className="btn-ghost"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Hide draft" : "View draft"}
            </button>
            {open &&
              (editing ? (
                <button className="btn-ghost" onClick={save} disabled={busy !== null}>
                  {busy === "save" ? "Saving…" : "Save"}
                </button>
              ) : (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setText(signal.draft?.content || "");
                    setEditing(true);
                  }}
                >
                  Edit
                </button>
              ))}
            <button className="btn-primary" onClick={toggleApprove} disabled={busy !== null}>
              {busy === "approve"
                ? "Updating…"
                : approved
                  ? "✓ Approved · Undo"
                  : "Approve"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Beats({
  beats,
  onChange,
}: {
  beats: Beat[];
  onChange: (b: Beat[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  async function api(url: string, method: string, body?: object) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (res.ok && data.beats) onChange(data.beats);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <p className="mb-3 text-xs text-faint">
        Beats are the topics the engine actively searches. Toggle, add, or remove.
      </p>
      <div className="flex flex-col divide-y divide-border">
        {beats.map((b) => (
          <div key={b.id} className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={b.active}
              onChange={() => api(`/api/news/beats/${b.id}`, "POST", { active: !b.active })}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-fg">{b.label}</span>
              <span className="block truncate text-[11px] text-faint">{b.query}</span>
            </span>
            <button
              className="text-faint hover:text-fg"
              title="Remove beat"
              onClick={() => api(`/api/news/beats/${b.id}`, "DELETE")}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
        <input
          className="input"
          placeholder="New beat label, e.g. AI in healthcare"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="input"
          placeholder="Search focus (keywords)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="btn-ghost self-end"
          disabled={busy || !label.trim()}
          onClick={async () => {
            await api("/api/news/beats", "POST", { label, query });
            setLabel("");
            setQuery("");
          }}
        >
          + Add beat
        </button>
      </div>
    </div>
  );
}
