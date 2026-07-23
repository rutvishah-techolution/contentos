import { listCampaigns, listPersonas } from "@/lib/brain";
import { listKnowledge } from "@/lib/knowledge";
import CampaignsSection from "@/components/CampaignsSection";
import KnowledgeBase from "@/components/KnowledgeBase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [campaigns, personas, knowledge] = await Promise.all([
    listCampaigns(),
    listPersonas(),
    listKnowledge(),
  ]);

  const active = campaigns.filter((c) => c.status !== "done").length;
  const done = campaigns.filter((c) => c.status === "done").length;

  const stats = [
    { label: "Campaigns", value: campaigns.length },
    { label: "In progress", value: active },
    { label: "Shipped", value: done },
    { label: "Knowledge docs", value: knowledge.length },
  ];

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[15px] font-semibold tracking-tight text-fg">
              ContentOS
            </span>
            <span className="text-xs text-faint">
              autonomous B2B content engine
            </span>
          </div>
          <span className="badge">{personas.length} research personas</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* intro */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Your content workspace
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Research, fact-check, storyline, and draft — every claim sourced and
            verified. Feed it your company knowledge and let it work.
          </p>
        </div>

        {/* stats */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card">
              <div className="text-2xl font-semibold tracking-tight text-fg">
                {s.value}
              </div>
              <div className="mt-0.5 text-xs text-faint">{s.label}</div>
            </div>
          ))}
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <CampaignsSection campaigns={campaigns} />
          <KnowledgeBase initialDocs={knowledge} />
        </div>
      </main>
    </div>
  );
}
