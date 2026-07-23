import { NextRequest, NextResponse } from "next/server";
import { assistDraft } from "@/lib/draft/draft";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim())
      return NextResponse.json({ error: "Empty message." }, { status: 400 });
    const draft = await assistDraft(slug, id, message);
    return NextResponse.json({ draft });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Assistant failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
