import { NextRequest, NextResponse } from "next/server";
import { approveSignal } from "@/lib/news/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    let approved = true;
    try {
      const body = await req.json();
      if (typeof body?.approved === "boolean") approved = body.approved;
    } catch {
      /* default approve */
    }
    const signal = await approveSignal(id, approved);
    return NextResponse.json({ signal });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Approve failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
