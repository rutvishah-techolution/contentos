import { NextRequest, NextResponse } from "next/server";
import { generateStorylines } from "@/lib/storyline/storyline";

export const maxDuration = 180;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const docs = await generateStorylines(slug);
    return NextResponse.json({ storylines: docs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
