import { NextRequest, NextResponse } from "next/server";
import { getBeats, addBeat } from "@/lib/news/beats";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ beats: await getBeats() });
}

export async function POST(req: NextRequest) {
  try {
    const { label, query } = await req.json();
    if (!label || typeof label !== "string")
      return NextResponse.json({ error: "Label required." }, { status: 400 });
    const beats = await addBeat(label.trim(), (query || "").toString().trim());
    return NextResponse.json({ beats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
