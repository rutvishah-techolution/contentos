import { NextRequest, NextResponse } from "next/server";
import { runSourceCheck } from "@/lib/research/sourceCheck";

export const maxDuration = 300;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const result = await runSourceCheck(slug);
    return NextResponse.json({ result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Source-check failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
