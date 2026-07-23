import { NextRequest, NextResponse } from "next/server";
import { deleteKnowledge } from "@/lib/knowledge";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteKnowledge(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
