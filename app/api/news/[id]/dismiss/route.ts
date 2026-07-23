import { NextRequest, NextResponse } from "next/server";
import { dismissSignal } from "@/lib/news/engine";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await dismissSignal(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Dismiss failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
