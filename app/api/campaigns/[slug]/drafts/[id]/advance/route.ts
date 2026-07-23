import { NextRequest, NextResponse } from "next/server";
import { advanceDraft } from "@/lib/draft/draft";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  try {
    const draft = await advanceDraft(slug, id);
    return NextResponse.json({ draft });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Advance failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
