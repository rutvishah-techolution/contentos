import { listCampaigns } from "@/lib/brain";
import { listKnowledge } from "@/lib/knowledge";
import { auth } from "@/auth";
import CampaignsSection from "@/components/CampaignsSection";

export const dynamic = "force-dynamic";

const ICONS: Record<string, React.ReactNode> = {
  campaigns: (
    <path
      d="M5 3h7l3 3v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M12 3v3h3"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
  progress: (
    <>
      <circle cx="9" cy="9" r="6.2" strokeWidth="1.4" />
      <path d="M9 5.5V9l2.5 1.5" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  shipped: (
    <>
      <circle cx="9" cy="9" r="6.2" strokeWidth="1.4" />
      <path d="M6.2 9.2l2 2 3.6-4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  docs: (
    <path
      d="M4 3.5A1.5 1.5 0 0 1 5.5 2H14v12H5.5A1.5 1.5 0 0 1 4 12.5v-9Z M14 11H5.5A1.5 1.5 0 0 0 4 12.5"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
};

export default async function Home() {
  const session = await auth();
  const [campaigns, knowledge] = await Promise.all([
    listCampaigns(session?.user?.id),
    listKnowledge(),
  ]);

  const active = campaigns.filter((c) => c.status !== "done").length;
  const done = campaigns.filter((c) => c.status === "done").length;

  const stats = [
    { key: "campaigns", label: "Total campaigns", value: campaigns.length },
    { key: "progress", label: "Currently active", value: active },
    { key: "shipped", label: "Completed", value: done },
    { key: "docs", label: "In your library", value: knowledge.length },
  ];

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Welcome back <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Research, fact-check, storyline, and draft — every claim sourced and
          verified.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="card stat-card">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-fg">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor">
                {ICONS[s.key]}
              </svg>
            </span>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-fg">
              {s.value}
            </div>
            <div className="mt-0.5 text-xs text-faint">{s.label}</div>
          </div>
        ))}
      </div>

      <CampaignsSection campaigns={campaigns} />
    </div>
  );
}
