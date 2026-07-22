import Link from "next/link";
import CreateCampaignPanel from "@/components/CreateCampaignPanel";
import { listCampaigns, listPersonas } from "@/lib/brain";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [campaigns, personas] = await Promise.all([
    listCampaigns(),
    listPersonas(),
  ]);
  const campaignCount = personas.filter((p) => p.stream === "campaign").length;
  const scoutCount = personas.filter((p) => p.stream === "scout").length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      {/* hero */}
      <header className="mb-12 text-center">
        <span className="badge mb-6">
          {campaignCount + scoutCount} research personas · V1
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Content that survives
          <br />a CFO&rsquo;s scrutiny.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-muted">
          The autonomous content engine for B2B — research, fact-check, storyline,
          draft. It starts with research: {campaignCount} campaign personas and{" "}
          {scoutCount} scouts dig your brief in parallel, every claim sourced and
          verified.
        </p>
        <div className="mt-8 flex justify-center">
          <CreateCampaignPanel />
        </div>
      </header>

      {/* existing campaigns */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">
          Campaigns {campaigns.length > 0 && `(${campaigns.length})`}
        </h2>
        {campaigns.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-faint">
            No campaigns yet. Create your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {campaigns.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/campaigns/${c.slug}`}
                  className="group flex items-center justify-between px-5 py-4 transition hover:bg-surface-2"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-medium text-fg">
                      {c.name}
                    </span>
                    <span className="mt-0.5 truncate text-xs text-faint">
                      {c.topic} · {formatDate(c.createdAt)}
                    </span>
                  </span>
                  <span className="ml-4 flex shrink-0 items-center gap-4">
                    <StatusPill status={c.status} />
                    <span className="text-faint transition group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    brief: "text-faint",
    researching: "text-warn",
    review: "text-link",
    approved: "text-ok",
  };
  return (
    <span className={`text-xs capitalize ${map[status] || "text-faint"}`}>
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
