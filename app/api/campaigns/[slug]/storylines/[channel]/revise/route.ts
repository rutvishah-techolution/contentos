import { NextRequest, NextResponse } from "next/server";
import { reviseStoryline } from "@/lib/storyline/storyline";
import { Channel } from "@/lib/storyline/types";

export const maxDuration = 120;

const VALID: Channel[] = ["blog", "linkedin", "instagram"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel } = await params;
  if (!VALID.includes(channel as Channel)) {
    return NextResponse.json({ error: "Unknown channel." }, { status: 400 });
  }
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
    const doc = await reviseStoryline(slug, channel as Channel, message);
    return NextResponse.json({ storyline: doc });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Revision failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
