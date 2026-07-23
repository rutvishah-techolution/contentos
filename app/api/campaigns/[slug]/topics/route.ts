import { NextRequest, NextResponse } from "next/server";
import { generateTopics } from "@/lib/storyline/topics";
import { Channel, SELECTABLE_CHANNELS } from "@/lib/storyline/types";

export const maxDuration = 180;

const SELECTABLE: Channel[] = SELECTABLE_CHANNELS;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let body: { channels?: string[]; feedback?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const channels = (body.channels || []).filter((c): c is Channel =>
    SELECTABLE.includes(c as Channel),
  );
  const feedback = (body.feedback || "").toString().trim();
  try {
    const bank = await generateTopics(slug, channels, feedback);
    return NextResponse.json({ bank });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Topic generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
