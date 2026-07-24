import { NextRequest, NextResponse } from "next/server";
import { generateDrafts } from "@/lib/draft/draft";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    let instructions = "";
    try {
      const body = await req.json();
      if (typeof body?.instructions === "string") instructions = body.instructions;
    } catch {
      /* no body → no instructions */
    }
    const drafts = await generateDrafts(slug, instructions);
    return NextResponse.json({ drafts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Draft generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
