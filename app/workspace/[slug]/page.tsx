import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign, canAccessCampaign } from "@/lib/brain";
import { auth } from "@/auth";
import { readDrafts, STAGE_LABEL } from "@/lib/draft/draft";
import { readStorylines } from "@/lib/storyline/storyline";
import { readTopicBank } from "@/lib/storyline/topics";
import { CHANNEL_LABELS } from "@/lib/storyline/types";
import { KindPill } from "@/components/TopicPlanner";

export const dynamic = "force-dynamic";

export default async function CampaignWorkspace({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, campaign, drafts, storylines, bank] = await Promise.all([
    auth(),
    getCampaign(slug),
    readDrafts(slug),
    readStorylines(slug),
    readTopicBank(slug),
  ]);
  if (!campaign) notFound();
  if (!canAccessCampaign(campaign, session?.user?.id)) notFound();

  const approved = drafts.filter((d) => d.approved);
  const inProgress = drafts.filter((d) => !d.approved);
  const draftedStorylineIds = new Set(drafts.map((d) => d.id));
  // storylines that exist but haven't been drafted yet
  const storylinesNoDraft = storylines.filter((s) => !draftedStorylineIds.has(s.id));
  const shelf = (bank?.topics || []).filter((t) => t.status === "available");

  const firstLine = (md: string) =>
    (md.split("\n").find((l) => l.trim().length > 0) || "")
      .replace(/^#+\s*/, "")
      .slice(0, 100);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <Link
        href="/workspace"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
      >
        ← Workspace
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {campaign.name}
        </h1>
        <p className="mt-1.5 truncate text-[15px] text-muted">{campaign.topic}</p>
      </div>

      {/* Final copy */}
      <Section
        title="Final copy"
        count={approved.length}
        empty="No approved copy yet. Approve a final draft and it lands here."
      >
        {approved.map((d) => (
          <Link
            key={d.id}
            href={`/campaigns/${slug}/content`}
            className="card block transition hover:border-border-strong"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="badge">{CHANNEL_LABELS[d.channel]}</span>
                <KindPill kind={d.kind} />
              </span>
              <span className="text-xs text-ok">✓ approved</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-fg">{firstLine(d.content)}</p>
            <span className="mt-2 inline-block text-xs text-muted">
              Open in editor →
            </span>
          </Link>
        ))}
      </Section>

      {/* In progress */}
      {inProgress.length > 0 && (
        <Section title="Drafts in progress" count={inProgress.length}>
          {inProgress.map((d) => (
            <Link
              key={d.id}
              href={`/campaigns/${slug}/content`}
              className="card block transition hover:border-border-strong"
            >
              <div className="flex items-center justify-between">
                <span className="badge">{CHANNEL_LABELS[d.channel]}</span>
                <span className="text-xs text-warn">{STAGE_LABEL[d.stage]}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-fg">
                {firstLine(d.content)}
              </p>
            </Link>
          ))}
        </Section>
      )}

      {/* Storylines awaiting a draft */}
      {storylinesNoDraft.length > 0 && (
        <Section title="Storylines — ready to draft" count={storylinesNoDraft.length}>
          {storylinesNoDraft.map((s) => (
            <Link
              key={s.id}
              href={`/campaigns/${slug}/content`}
              className="card block transition hover:border-border-strong"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="badge">{CHANNEL_LABELS[s.channel]}</span>
                  <KindPill kind={s.kind} />
                </span>
                {s.approved && <span className="text-xs text-ok">✓ approved</span>}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-fg">
                {s.storyline.headline}
              </p>
            </Link>
          ))}
        </Section>
      )}

      {/* Topic shelf / content bank */}
      <Section
        title="Content bank — topics on the shelf"
        count={shelf.length}
        empty="No unused topics. Generate topics in the storyline stage."
      >
        {shelf.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="badge">{CHANNEL_LABELS[t.channel]}</span>
                <KindPill kind={t.kind} />
              </span>
              <span className="text-xs text-faint">{t.personaName}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-fg">{t.headline}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted">{t.angle}</p>
          </div>
        ))}
        {shelf.length > 0 && (
          <Link
            href={`/campaigns/${slug}/storyline`}
            className="flex items-center justify-center rounded-xl border border-dashed border-border p-4 text-sm text-muted transition hover:border-border-strong hover:text-fg"
          >
            Produce more from the shelf →
          </Link>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-medium text-muted">
        {title} {count > 0 && `(${count})`}
      </h2>
      {count === 0 && empty ? (
        <p className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-faint">
          {empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
      )}
    </section>
  );
}
