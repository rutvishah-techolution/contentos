import { NextRequest, NextResponse } from "next/server";
import { scan } from "@/lib/news/engine";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  // cron protection: if NEWS_CRON_SECRET is set, require it (button passes it too
  // via same-origin; only external callers need the header)
  const secret = process.env.NEWS_CRON_SECRET;
  if (secret) {
    const provided =
      req.headers.get("x-cron-secret") ||
      new URL(req.url).searchParams.get("secret");
    // allow the same-origin UI button; external callers (cron) need the secret
    const origin = req.headers.get("origin") || "";
    const host = req.headers.get("host") || "";
    const sameOrigin = !!host && origin.endsWith(host);
    if (provided !== secret && !sameOrigin)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const result = await scan();
    return NextResponse.json({
      created: result.created.length,
      drafted: result.drafted,
      skipped: result.skipped,
      signals: result.created,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Scan failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
