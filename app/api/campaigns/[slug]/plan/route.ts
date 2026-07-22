import { NextRequest, NextResponse } from "next/server";
import { generatePlan } from "@/lib/storyline/plan";
import { Channel } from "@/lib/storyline/types";

export const maxDuration = 120;

const VALID: Channel[] = ["blog", "linkedin", "instagram"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let body: { channels?: string[]; feedback?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const channels = (body.channels || []).filter((c): c is Channel =>
    VALID.includes(c as Channel),
  );
  const feedback = (body.feedback || "").toString().trim();
  if (channels.length === 0) {
    return NextResponse.json(
      { error: "Select at least one channel." },
      { status: 400 },
    );
  }
  try {
    const plan = await generatePlan(slug, channels, feedback);
    return NextResponse.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Plan generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
