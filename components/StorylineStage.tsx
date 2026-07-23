"use client";

import { useState } from "react";
import TopicPlanner from "@/components/TopicPlanner";
import StorylineStudio from "@/components/StorylineStudio";
import type { TopicBank } from "@/lib/storyline/topics";
import type { StorylineDoc } from "@/lib/storyline/types";

export default function StorylineStage({
  slug,
  bank,
  personas,
  storylines,
}: {
  slug: string;
  bank: TopicBank | null;
  personas: { id: string; name: string }[];
  storylines: StorylineDoc[];
}) {
  const hasStorylines = storylines.length > 0;
  const [shelfOpen, setShelfOpen] = useState(!hasStorylines);
  const available = (bank?.topics || []).filter((t) => t.status === "available").length;

  // Nothing produced yet → the planner IS the screen.
  if (!hasStorylines) {
    return <TopicPlanner slug={slug} initialBank={bank} personas={personas} />;
  }

  // Once storylines exist, they become the focus; the shelf tucks away.
  return (
    <div className="flex flex-col gap-8">
      <StorylineStudio slug={slug} storylines={storylines} />

      <section className="rounded-xl border border-border">
        <button
          onClick={() => setShelfOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
        >
          <span className="font-medium text-fg">
            {shelfOpen ? "▾" : "▸"} Topic shelf
          </span>
          <span className="text-xs text-faint">
            {available} on the shelf · pick more to produce
          </span>
        </button>
        {shelfOpen && (
          <div className="border-t border-border p-4">
            <TopicPlanner slug={slug} initialBank={bank} personas={personas} />
          </div>
        )}
      </section>
    </div>
  );
}
