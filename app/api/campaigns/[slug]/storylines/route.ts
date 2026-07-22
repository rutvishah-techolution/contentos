import { NextRequest, NextResponse } from "next/server";
import { generateStorylines } from "@/lib/storyline/storyline";

export const maxDuration = 200;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let topicIds: string[] = [];
  try {
    const body = await req.json();
    topicIds = Array.isArray(body?.topicIds) ? body.topicIds.map(String) : [];
  } catch {
    /* no body */
  }
  if (topicIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one topic." },
      { status: 400 },
    );
  }
  try {
    const docs = await generateStorylines(slug, topicIds);
    return NextResponse.json({ storylines: docs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
