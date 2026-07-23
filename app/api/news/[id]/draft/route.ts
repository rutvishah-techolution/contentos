import { NextRequest, NextResponse } from "next/server";
import { draftSignal } from "@/lib/news/engine";

export const maxDuration = 120;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const signal = await draftSignal(id);
    return NextResponse.json({ signal });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Draft failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
