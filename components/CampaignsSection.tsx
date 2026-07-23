"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NewCampaignForm from "@/components/NewCampaignForm";
import type { Campaign } from "@/lib/brain";

const STAGE: Record<string, { label: string; cls: string }> = {
  brief: { label: "Brief", cls: "text-faint" },
  researching: { label: "Researching", cls: "text-warn" },
  review: { label: "Research review", cls: "text-link" },
  planning: { label: "Storyline", cls: "text-link" },
  storyline: { label: "Storyline", cls: "text-link" },
  drafting: { label: "Drafting", cls: "text-warn" },
  done: { label: "Shipped", cls: "text-ok" },
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

  async function del(slug: string, name: string) {
    if (!confirm(`Delete "${name}"? This removes all its research, storylines, and drafts. This can't be undone.`))
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
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">
          Campaigns {list.length > 0 && `(${list.length})`}
        </h2>
        {!creating && (
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + New campaign
          </button>
        )}
      </div>

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
          {list.map((c) => {
            const stage = STAGE[c.status] || { label: c.status, cls: "text-faint" };
            return (
              <li
                key={c.slug}
                className="group flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface-2"
              >
                <Link href={`/campaigns/${c.slug}`} className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px] font-medium text-fg">
                    {c.name}
                  </span>
                  <span className="mt-0.5 truncate text-xs text-faint">
                    {c.topic} · {formatDate(c.createdAt)}
                  </span>
                </Link>
                <span className="flex shrink-0 items-center gap-4">
                  <span className={`text-xs ${stage.cls}`}>{stage.label}</span>
                  <button
                    onClick={() => del(c.slug, c.name)}
                    disabled={deleting === c.slug}
                    title="Delete campaign"
                    className="text-faint opacity-0 transition hover:text-warn group-hover:opacity-100"
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
            );
          })}
        </ul>
      )}
    </section>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
