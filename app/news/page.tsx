import { getBeats } from "@/lib/news/beats";
import { readSignals } from "@/lib/news/store";
import NewsFeed from "@/components/NewsFeed";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [beats, signals] = await Promise.all([getBeats(), readSignals()]);
  const active = signals.filter((s) => s.status !== "dismissed");

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">News</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Time-sensitive news, actively fetched and judged. It tells you what&rsquo;s
          worth posting, why, and drafts the urgent ones — you approve.
        </p>
      </div>
      <NewsFeed initialBeats={beats} initialSignals={active} />
    </div>
  );
}
