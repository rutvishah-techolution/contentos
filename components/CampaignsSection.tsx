"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NewCampaignForm from "@/components/NewCampaignForm";
import type { Campaign } from "@/lib/brain";

const STAGE_LABEL: Record<string, string> = {
  brief: "Brief",
  researching: "Researching",
  review: "Research review",
  planning: "Storyline",
  storyline: "Storyline",
  drafting: "Drafting",
  done: "Shipped",
};

type Sort = "recent" | "created" | "name";
const SORT_LABEL: Record<Sort, string> = {
  recent: "Recently updated",
  created: "Newest",
  name: "Name",
};

export default function CampaignsSection({
  campaigns,
}: {
  campaigns: Campaign[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [list, setList] = useState<Campaign[]>(campaigns);
  const [sort, setSort] = useState<Sort>("recent");
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function join() {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch("/api/campaigns/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't join.");
      setJoinCode("");
      setJoinOpen(false);
      router.refresh();
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : "Couldn't join.");
    } finally {
      setJoining(false);
    }
  }

  const sorted = useMemo(() => {
    const copy = [...list];
    if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "created")
      copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else
      copy.sort((a, b) =>
        (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt),
      );
    return copy;
  }, [list, sort]);

  async function del(slug: string, name: string) {
    if (
      !confirm(
        `Delete "${name}"? This removes all its research, storylines, and drafts. This can't be undone.`,
      )
    )
      return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/campaigns/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setList((cur) => cur.filter((c) => c.slug !== slug));
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted">
          Campaigns {list.length > 0 && `(${list.length})`}
        </h2>
        <div className="flex items-center gap-2">
          {list.length > 1 && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-xs text-muted outline-none transition hover:border-fg"
            >
              {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
                <option key={s} value={s}>
                  {SORT_LABEL[s]}
                </option>
              ))}
            </select>
          )}
          {!creating && (
            <>
              <button
                className="btn-ghost"
                onClick={() => setJoinOpen((v) => !v)}
              >
                Join with code
              </button>
              <button className="btn-primary" onClick={() => setCreating(true)}>
                + New campaign
              </button>
            </>
          )}
        </div>
      </div>

      {joinOpen && !creating && (
        <div className="card mb-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-fg">
                Join a teammate&rsquo;s campaign
              </label>
              <input
                className="input font-mono"
                placeholder="Enter code, e.g. C-7QK2A"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={join}
              disabled={joining || !joinCode.trim()}
            >
              {joining ? "Joining…" : "Join"}
            </button>
          </div>
          {joinError && <p className="alert-error mt-2">{joinError}</p>}
        </div>
      )}

      {creating && (
        <div className="card mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-fg">New campaign</h3>
            <button
              className="text-xs text-faint hover:text-fg"
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
          </div>
          <NewCampaignForm />
        </div>
      )}

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-faint">
          No campaigns yet. Create your first one.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {sorted.map((c) => (
            <li
              key={c.slug}
              className="group flex min-w-0 items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface-2"
            >
              <Link href={`/campaigns/${c.slug}`} className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-medium text-fg">
                    {c.name}
                  </span>
                  <StatusPill status={c.status} />
                </span>
                <span className="mt-0.5 truncate text-xs text-faint">{c.topic}</span>
              </Link>
              <span className="flex shrink-0 items-center gap-4">
                <span className="hidden text-xs text-faint sm:inline">
                  Updated <RelativeTime iso={c.updatedAt || c.createdAt} />
                </span>
                <button
                  onClick={() => del(c.slug, c.name)}
                  disabled={deleting === c.slug}
                  title="Delete campaign"
                  className="text-faint opacity-0 transition hover:text-fg group-hover:opacity-100"
                >
                  {deleting === c.slug ? "…" : "🗑"}
                </button>
                <Link
                  href={`/campaigns/${c.slug}`}
                  className="text-faint transition group-hover:translate-x-0.5"
                >
                  →
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = STAGE_LABEL[status] || status;
  // monochrome, matches our base — completed is filled, everything else outlined
  if (status === "done") {
    return (
      <span className="shrink-0 rounded-full bg-fg px-2.5 py-0.5 text-[11px] font-medium text-accent-fg">
        {label}
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full border border-border-strong bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">
      {label}
    </span>
  );
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function absolute(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
function relative(iso: string): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)}d ago`;
  return absolute(iso);
}

// Renders the deterministic absolute date on the server, swaps to relative
// after mount — so server and client HTML match (no hydration mismatch).
function RelativeTime({ iso }: { iso: string }) {
  const [txt, setTxt] = useState(() => absolute(iso));
  useEffect(() => setTxt(relative(iso)), [iso]);
  return <>{txt}</>;
}
