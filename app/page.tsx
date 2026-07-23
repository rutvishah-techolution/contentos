import { listCampaigns } from "@/lib/brain";
import { listKnowledge } from "@/lib/knowledge";
import CampaignsSection from "@/components/CampaignsSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [campaigns, knowledge] = await Promise.all([
    listCampaigns(),
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
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Campaigns</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Research, fact-check, storyline, and draft — every claim sourced and
          verified.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card stat-card">
            <div className="text-2xl font-semibold tracking-tight text-fg">
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
