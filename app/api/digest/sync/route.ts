import { NextRequest, NextResponse } from "next/server";
import { syncDigest, getRelevantDigest } from "@/lib/integrations/digest";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const summary = await syncDigest();
    const topic = req.nextUrl.searchParams.get("topic");
    const sample = topic ? await getRelevantDigest(topic, 5) : [];
    return NextResponse.json({ summary, sample });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Digest sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
