import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/brain";
import { getResearchBundle } from "@/lib/research/read";
import { readPlan } from "@/lib/storyline/plan";
import { readStorylines } from "@/lib/storyline/storyline";
import StorylinePlanner from "@/components/StorylinePlanner";
import StorylineStudio from "@/components/StorylineStudio";

export const dynamic = "force-dynamic";

export default async function StorylinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [campaign, bundle, plan, storylines] = await Promise.all([
    getCampaign(slug),
    getResearchBundle(slug),
    readPlan(slug),
    readStorylines(slug),
  ]);
  if (!campaign) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <Link
        href={`/campaigns/${slug}/research`}
        className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        ← Research
      </Link>

      <header className="mb-8">
        <span className="badge mb-4 capitalize">{campaign.status}</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {campaign.name}
        </h1>
        <p className="mt-2 text-muted">
          Storyline — plan the content pieces, one distinct angle per channel.
        </p>
      </header>

      {bundle.campaignBase ? (
        <div className="flex flex-col gap-10">
          <StorylinePlanner slug={slug} initialPlan={plan} />
          {plan?.approved && (
            <StorylineStudio slug={slug} initialStorylines={storylines} />
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-muted">
            Research isn&rsquo;t ready yet. The storyline is built from the
            approved research base.
          </p>
          <Link
            href={`/campaigns/${slug}/research`}
            className="mt-3 inline-block text-sm font-medium text-fg hover:underline"
          >
            Go to research →
          </Link>
        </div>
      )}
    </main>
  );
}
