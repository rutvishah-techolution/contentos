import { NextRequest, NextResponse } from "next/server";
import { reviseStoryline } from "@/lib/storyline/storyline";

export const maxDuration = 120;

// NOTE: the dynamic segment is [channel] historically, but the value is the piece id.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel: id } = await params;
  let message = "";
  try {
    const body = await req.json();
    message = (body?.message || "").toString().trim();
  } catch {
    /* no body */
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  try {
    const doc = await reviseStoryline(slug, id, message);
    return NextResponse.json({ storyline: doc });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Revision failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
