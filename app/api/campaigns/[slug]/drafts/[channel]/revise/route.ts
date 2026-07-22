import { NextRequest, NextResponse } from "next/server";
import { reviseDraft } from "@/lib/draft/draft";

export const maxDuration = 120;

// dynamic segment is the piece id
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
    const draft = await reviseDraft(slug, id, message);
    return NextResponse.json({ draft });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Revision failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
