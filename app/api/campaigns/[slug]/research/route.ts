import { NextRequest, NextResponse } from "next/server";
import { runResearch } from "@/lib/research/orchestrator";

// Research uses live web search across many personas — allow a generous window.
export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let feedback = "";
  try {
    const body = await req.json();
    feedback = (body?.feedback || "").toString().trim();
  } catch {
    /* no body / no feedback */
  }
  try {
    const results = await runResearch(slug, feedback);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Research failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
