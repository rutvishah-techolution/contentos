import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/brain";
import { getResearchBundle } from "@/lib/research/read";
import ResearchResults from "@/components/ResearchResults";

export const dynamic = "force-dynamic";

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [campaign, bundle] = await Promise.all([
    getCampaign(slug),
    getResearchBundle(slug),
  ]);
  if (!campaign) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
      <Link
        href={`/campaigns/${slug}`}
        className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        ← Back to campaign
      </Link>

      <header className="animate-fade-in mb-8">
        <span className="badge mb-4 capitalize">{campaign.status}</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {campaign.topic}
        </h1>
        <p className="mt-2 text-muted">Market research — verified results</p>
      </header>

      {bundle.hasResearch ? (
        <div className="animate-fade-in">
          <ResearchResults
            slug={slug}
            status={campaign.status}
            bundle={bundle}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-faint">
          No research yet. Run Market Research from the campaign page.
        </p>
      )}
    </main>
  );
}
