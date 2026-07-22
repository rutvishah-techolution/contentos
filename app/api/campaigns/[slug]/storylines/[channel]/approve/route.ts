import { NextRequest, NextResponse } from "next/server";
import { approveStoryline } from "@/lib/storyline/storyline";
import { Channel } from "@/lib/storyline/types";

const VALID: Channel[] = ["blog", "linkedin", "instagram"];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel } = await params;
  if (!VALID.includes(channel as Channel)) {
    return NextResponse.json({ error: "Unknown channel." }, { status: 400 });
  }
  try {
    const result = await approveStoryline(slug, channel as Channel);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Approve failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
