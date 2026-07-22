import { NextRequest, NextResponse } from "next/server";
import { approveDraft } from "@/lib/draft/draft";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; channel: string }> },
) {
  const { slug, channel: id } = await params;
  try {
    const result = await approveDraft(slug, id);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Approve failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
