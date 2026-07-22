import { NextRequest, NextResponse } from "next/server";
import { approveStoryline } from "@/lib/storyline/storyline";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel: id } = await params;
  try {
    const result = await approveStoryline(slug, id);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Approve failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
