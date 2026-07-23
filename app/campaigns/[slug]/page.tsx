import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign, listPersonas } from "@/lib/brain";
import { getResearchBundle } from "@/lib/research/read";
import RunResearchButton from "@/components/RunResearchButton";
import ShareCode from "@/components/ShareCode";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [campaign, personas, bundle] = await Promise.all([
    getCampaign(slug),
    listPersonas(),
    getResearchBundle(slug),
  ]);
  if (!campaign) notFound();

  const campaignPersonas = personas.filter((p) => p.stream === "campaign");
  const scoutPersonas = personas.filter((p) => p.stream === "scout");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        ← All campaigns
      </Link>

      <header className="animate-fade-in mb-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="badge capitalize">{campaign.status}</span>
          <ShareCode code={campaign.joinCode} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {campaign.name}
        </h1>
        <p className="mt-2 text-muted">{campaign.topic}</p>
      </header>

      {/* stage navigation */}
      <nav className="mb-8 flex flex-wrap gap-2 text-sm">
        {[
          { label: "Research", href: `/campaigns/${slug}/research` },
          { label: "Storyline", href: `/campaigns/${slug}/storyline` },
          { label: "Content", href: `/campaigns/${slug}/content` },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="btn-ghost">
            {s.label} →
          </Link>
        ))}
      </nav>

      <section className="animate-fade-in card mb-6">
        {campaign.objective && (
          <>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
              Objective
            </h2>
            <p className="whitespace-pre-wrap text-sm text-fg">
              {campaign.objective}
            </p>
          </>
        )}
        {campaign.icp && (
          <>
            <h2 className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-faint">
              Target ICP
            </h2>
            <p className="whitespace-pre-wrap text-sm text-fg">{campaign.icp}</p>
          </>
        )}
        {campaign.constraints && (
          <>
            <h2 className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-faint">
              Constraints
            </h2>
            <p className="whitespace-pre-wrap text-sm text-fg">
              {campaign.constraints}
            </p>
          </>
        )}
      </section>

      <section className="animate-fade-in card mb-8">
        <h2 className="mb-4 text-sm font-medium text-muted">
          Research personas that will run
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <PersonaColumn
            title={`Campaign (${campaignPersonas.length})`}
            personas={campaignPersonas.map((p) => p.name)}
          />
          <PersonaColumn
            title={`Scouts (${scoutPersonas.length})`}
            personas={scoutPersonas.map((p) => p.name)}
          />
        </div>
      </section>

      <RunResearchButton
        slug={campaign.slug}
        personaNames={personas.map((p) => p.name)}
        hasResearch={bundle.hasResearch}
      />
    </main>
  );
}

function PersonaColumn({
  title,
  personas,
}: {
  title: string;
  personas: string[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {personas.map((name) => (
          <li key={name} className="flex items-center gap-2 text-sm text-fg">
            <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
            {name}
          </li>
        ))}
        {personas.length === 0 && (
          <li className="text-sm text-faint">None yet</li>
        )}
      </ul>
    </div>
  );
}
