import { NextRequest, NextResponse } from "next/server";
import { approveStoryline } from "@/lib/storyline/storyline";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel: id } = await params;
  try {
    let approved = true;
    try {
      const body = await req.json();
      if (typeof body?.approved === "boolean") approved = body.approved;
    } catch {
      /* no body → default approve */
    }
    const result = await approveStoryline(slug, id, approved);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Approve failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
