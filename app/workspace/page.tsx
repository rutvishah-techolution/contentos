import Link from "next/link";
import { listCampaigns } from "@/lib/brain";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const session = await auth();
  const campaigns = await listCampaigns(session?.user?.id);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Workspace</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Every campaign&rsquo;s produced work — drafts, storylines, and the topic
          shelf. Pick a campaign to open its workspace.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-faint">
          No campaigns yet. Create one to start producing content.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {campaigns.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/workspace/${c.slug}`}
                className="card block h-full transition hover:border-border-strong"
              >
                <span className="block truncate text-[15px] font-medium text-fg">
                  {c.name}
                </span>
                <span className="mt-1 block truncate text-xs text-faint">
                  {c.topic}
                </span>
                <span className="mt-3 inline-block text-xs capitalize text-muted">
                  {c.status} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
