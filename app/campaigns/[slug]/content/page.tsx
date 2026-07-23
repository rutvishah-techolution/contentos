import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/brain";
import { readStorylines } from "@/lib/storyline/storyline";
import { readDrafts } from "@/lib/draft/draft";
import DraftStudio from "@/components/DraftStudio";

export const dynamic = "force-dynamic";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [campaign, storylines, drafts] = await Promise.all([
    getCampaign(slug),
    readStorylines(slug),
    readDrafts(slug),
  ]);
  if (!campaign) notFound();

  const anyApprovedStoryline = storylines.some((s) => s.approved);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <Link
        href={`/campaigns/${slug}/storyline`}
        className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        ← Storyline
      </Link>

      <header className="mb-8">
        <span className="badge mb-4 capitalize">{campaign.status}</span>
        <h1 className="text-3xl font-semibold tracking-tight">{campaign.name}</h1>
        <p className="mt-2 text-muted">
          Draft the copy — step each piece Draft 1 → Draft 2 → Final, with an AI
          assistant to fact-check as you go.
        </p>
      </header>

      {anyApprovedStoryline ? (
        <DraftStudio slug={slug} initialDrafts={drafts} />
      ) : (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-muted">
            Approve at least one storyline first — drafts are written from
            approved storylines.
          </p>
          <Link
            href={`/campaigns/${slug}/storyline`}
            className="mt-3 inline-block text-sm font-medium text-fg hover:underline"
          >
            Go to storyline →
          </Link>
        </div>
      )}
    </main>
  );
}
