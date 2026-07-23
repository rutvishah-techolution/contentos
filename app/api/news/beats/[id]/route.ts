import { NextRequest, NextResponse } from "next/server";
import { updateBeat, deleteBeat } from "@/lib/news/beats";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const patch = await req.json();
    const beats = await updateBeat(id, patch);
    return NextResponse.json({ beats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const beats = await deleteBeat(id);
    return NextResponse.json({ beats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
