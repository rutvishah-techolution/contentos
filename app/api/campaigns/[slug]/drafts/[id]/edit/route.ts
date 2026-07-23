import { NextRequest, NextResponse } from "next/server";
import { editDraft } from "@/lib/draft/draft";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  try {
    const { content } = await req.json();
    if (typeof content !== "string" || !content.trim())
      return NextResponse.json({ error: "Empty content." }, { status: 400 });
    const draft = await editDraft(slug, id, content);
    return NextResponse.json({ draft });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Edit failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
