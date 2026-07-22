"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ResearchBundle } from "@/lib/research/read";
import type { SourceEntry } from "@/lib/research/sources";

type Tab = "campaign" | "scout" | "personas" | "sources" | "log";

export default function ResearchResults({
  slug,
  status,
  bundle,
}: {
  slug: string;
  status: string;
  bundle: ResearchBundle;
}) {
  const [tab, setTab] = useState<Tab>("campaign");

  const sourceCount =
    (bundle.sources?.campaign.length || 0) +
    (bundle.sources?.scout.length || 0);
  const tabs: { key: Tab; label: string }[] = [
    { key: "campaign", label: "Campaign Research" },
    { key: "scout", label: "Scout Research" },
    { key: "personas", label: `Per-persona (${bundle.raw.length})` },
    { key: "sources", label: `Index (${sourceCount})` },
    { key: "log", label: "Validation Log" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ReviewGate slug={slug} status={status} />

      {/* tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition ${
              tab === t.key
                ? "border-accent text-fg"
                : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "campaign" && (
        <BaseView
          doc={bundle.campaignBase}
          empty="No campaign research base yet."
        />
      )}
      {tab === "scout" && (
        <BaseView doc={bundle.scoutBase} empty="No scout research base yet." />
      )}
      {tab === "personas" && <PersonaDrilldown bundle={bundle} />}
      {tab === "sources" && <SourcesView bundle={bundle} />}
      {tab === "log" && (
        <div className="card">
          {bundle.validationLog ? (
            <div className="md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {bundle.validationLog}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-faint">No validation log yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function BaseView({
  doc,
  empty,
}: {
  doc: ResearchBundle["campaignBase"];
  empty: string;
}) {
  if (!doc) return <p className="text-sm text-faint">{empty}</p>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Stat label="Verified" value={doc.verified} tone="ok" />
        <Stat label="Flagged" value={doc.flagged} tone="warn" />
        <Stat label="Stripped" value={doc.stripped} tone="danger" />
      </div>
      <div className="card md">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "danger";
}) {
  const color =
    tone === "ok"
      ? "text-ok"
      : tone === "warn"
        ? "text-warn"
        : "text-danger";
  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-surface px-3 py-2">
      <span className={`text-lg font-semibold ${color}`}>{value}</span>
      <span className="text-xs text-faint">{label}</span>
    </div>
  );
}

function PersonaDrilldown({ bundle }: { bundle: ResearchBundle }) {
  const [open, setOpen] = useState<string | null>(bundle.raw[0]?.personaId ?? null);
  return (
    <div className="flex flex-col gap-2">
      {bundle.raw.map((p) => {
        const isOpen = open === p.personaId;
        return (
          <div key={p.personaId} className="overflow-hidden rounded-xl border border-border bg-surface">
            <button
              onClick={() => setOpen(isOpen ? null : p.personaId)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-surface-2"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-fg">{p.personaName}</span>
                <span className="text-xs text-faint">
                  {p.stream} · {p.model}
                </span>
              </span>
              <span className="flex items-center gap-3 text-xs text-faint">
                {p.error ? (
                  <span className="text-danger">failed</span>
                ) : (
                  <span>{p.findings.length} findings</span>
                )}
                <span>{isOpen ? "−" : "+"}</span>
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-border px-4 py-3">
                {p.error ? (
                  <p className="alert-error">{p.error}</p>
                ) : (
                  <>
                    {p.summary && (
                      <p className="mb-4 text-sm text-muted">{p.summary}</p>
                    )}
                    <ol className="flex flex-col gap-4">
                      {p.findings.map((f, i) => (
                        <li key={i} className="border-l-2 border-border-strong pl-3">
                          <p className="text-sm font-medium text-fg">{f.claim}</p>
                          <p className="mt-1 text-xs text-muted">
                            <span className="text-faint">Evidence: </span>
                            {f.evidence}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            <span className="text-faint">Why it matters: </span>
                            {f.whyItMatters}
                          </p>
                          {f.sourceUrl && (
                            <a
                              href={f.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block truncate text-xs text-accent hover:underline"
                            >
                              {f.sourceUrl.slice(0, 80)}
                            </a>
                          )}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SourcesView({ bundle }: { bundle: ResearchBundle }) {
  const s = bundle.sources;
  if (!s || (s.campaign.length === 0 && s.scout.length === 0)) {
    return <p className="text-sm text-faint">No sources indexed yet.</p>;
  }
  return (
    <div className="flex flex-col gap-8">
      <SourceGroup title="Campaign sources" items={s.campaign} />
      <SourceGroup title="Scout sources" items={s.scout} />
    </div>
  );
}

function SourceGroup({
  title,
  items,
}: {
  title: string;
  items: SourceEntry[];
}) {
  if (!items || items.length === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted">{title} (0)</h3>
        <p className="text-sm text-faint">None.</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted">
        {title} ({items.length})
      </h3>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-faint">
              <th className="px-4 py-2.5 font-medium">Article</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">Date</th>
              <th className="px-3 py-2.5 font-medium">Used by</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                Picked from
              </th>
              <th className="px-4 py-2.5 font-medium">Reuse</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e, i) => (
              <tr key={i} className="border-b border-border last:border-0 align-top">
                <td className="max-w-[280px] px-4 py-3">
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    title={e.title}
                    className="line-clamp-2 font-medium text-link hover:underline"
                  >
                    {e.title}
                  </a>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">
                  {e.publishedAt || "—"}
                </td>
                <td className="px-3 py-3 text-muted">{e.personas.join(", ")}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">
                  {e.origin === "digest" ? "Daily digest" : "Web search"}
                </td>
                <td className="px-4 py-3">
                  <span className={e.reusedIn.length ? "text-warn" : "text-ok"}>
                    {e.reusedIn.length ? `${e.reusedIn.length} campaigns` : "unique"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewGate({ slug, status }: { slug: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "sendback">(null);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  // research is "approved" at status `approved` and every stage after it
  const researchDone = !["brief", "researching", "review"].includes(status);
  const [approved, setApproved] = useState(researchDone);
  const [msg, setMsg] = useState<string | null>(null);

  async function approve() {
    setBusy("approve");
    setMsg(null);
    try {
      const res = await fetch(`/api/campaigns/${slug}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve.");
      setApproved(true);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function sendBack() {
    setBusy("sendback");
    setMsg(null);
    try {
      await fetch(`/api/campaigns/${slug}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: note }),
      });
      await fetch(`/api/campaigns/${slug}/source-check`, { method: "POST" });
      setShowNote(false);
      setNote("");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  if (approved) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
        <span className="flex items-center gap-2">
          <span className="text-ok">✓</span>
          <span className="text-fg">Research approved.</span>
        </span>
        <a href={`/campaigns/${slug}/storyline`} className="btn-primary">
          Continue to storyline →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-medium text-fg">Human check</span>
          <span className="ml-2 text-faint">
            Review the two research bases, then approve or send back.
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost"
            onClick={() => setShowNote((s) => !s)}
            disabled={busy !== null}
          >
            {busy === "sendback" ? "Re-running…" : "Send back"}
          </button>
          <button className="btn-primary" onClick={approve} disabled={busy !== null}>
            {busy === "approve" ? "Approving…" : "Approve"}
          </button>
        </div>
      </div>

      {showNote && (
        <div className="mt-3 flex flex-col gap-2">
          <label className="text-xs text-faint">
            What didn&rsquo;t land? The personas will address this on the re-run.
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="e.g. Too generic on ROI — I want hard numbers and named companies. Drop the healthcare tangent, and cover the regulatory risk angle."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="btn-primary self-end"
            onClick={sendBack}
            disabled={busy !== null || !note.trim()}
          >
            {busy === "sendback" ? "Re-running research…" : "Send back & re-run"}
          </button>
        </div>
      )}

      {msg && <p className="alert-error mt-3">{msg}</p>}
    </div>
  );
}
