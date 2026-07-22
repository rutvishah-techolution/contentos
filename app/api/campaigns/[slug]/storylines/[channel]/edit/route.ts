import { NextRequest, NextResponse } from "next/server";
import { editStoryline } from "@/lib/storyline/storyline";
import { Storyline } from "@/lib/storyline/types";

// dynamic segment is the piece id
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel: id } = await params;
  let patch: Partial<Storyline> = {};
  try {
    patch = (await req.json())?.patch || {};
  } catch {
    /* no body */
  }
  try {
    const doc = await editStoryline(slug, id, patch);
    return NextResponse.json({ storyline: doc });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Edit failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
