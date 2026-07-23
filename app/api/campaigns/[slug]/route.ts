import { NextRequest, NextResponse } from "next/server";
import { deleteCampaign, getCampaign } from "@/lib/brain";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const c = await getCampaign(slug);
    if (!c) return NextResponse.json({ error: "Not found." }, { status: 404 });
    await deleteCampaign(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
