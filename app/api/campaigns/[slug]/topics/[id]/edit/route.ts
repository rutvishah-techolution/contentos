import { NextRequest, NextResponse } from "next/server";
import { updateTopic } from "@/lib/storyline/topics";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  let patch: { angle?: string; headline?: string; personaId?: string } = {};
  try {
    patch = (await req.json())?.patch || {};
  } catch {
    /* no body */
  }
  try {
    const bank = await updateTopic(slug, id, patch);
    return NextResponse.json({ bank });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Edit failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
