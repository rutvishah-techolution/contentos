import { NextRequest, NextResponse } from "next/server";
import { addCustomTopic } from "@/lib/storyline/topics";
import { Channel } from "@/lib/storyline/types";

const VALID: Channel[] = ["longform", "blog", "linkedin", "instagram"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let body: {
    channel?: string;
    headline?: string;
    angle?: string;
    personaId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const channel = body.channel as Channel;
  if (!VALID.includes(channel) || !body.headline) {
    return NextResponse.json(
      { error: "Channel and headline required." },
      { status: 400 },
    );
  }
  try {
    const bank = await addCustomTopic(slug, {
      channel,
      headline: body.headline,
      angle: body.angle || "",
      personaId: body.personaId || "",
    });
    return NextResponse.json({ bank });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Add failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
