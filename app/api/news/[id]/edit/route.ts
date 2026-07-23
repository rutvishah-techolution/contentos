import { NextRequest, NextResponse } from "next/server";
import { editSignalDraft } from "@/lib/news/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { content } = await req.json();
    if (typeof content !== "string" || !content.trim())
      return NextResponse.json({ error: "Empty content." }, { status: 400 });
    const signal = await editSignalDraft(id, content);
    return NextResponse.json({ signal });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Edit failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
