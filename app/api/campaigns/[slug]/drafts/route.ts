import { NextRequest, NextResponse } from "next/server";
import { generateDrafts } from "@/lib/draft/draft";

export const maxDuration = 300;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const drafts = await generateDrafts(slug);
    return NextResponse.json({ drafts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Draft generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
