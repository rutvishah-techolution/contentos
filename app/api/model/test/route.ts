import { NextRequest, NextResponse } from "next/server";
import { callModel, normalizeModel } from "@/lib/models/router";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const model = normalizeModel(req.nextUrl.searchParams.get("model") || "claude");
  try {
    const text = await callModel(model, {
      system:
        "You are a research assistant. Use web_search when you need current facts.",
      user: "In one sentence, give one specific enterprise-AI news item from the last few weeks, with its real source URL.",
      maxTokens: 400,
      webSearch: true,
    });
    return NextResponse.json({ model, text });
  } catch (err) {
    return NextResponse.json(
      { model, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
