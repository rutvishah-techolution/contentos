import { NextRequest, NextResponse } from "next/server";
import { extractBriefFromDoc } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const brief = await extractBriefFromDoc(file.name, buffer);
    return NextResponse.json({ brief });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Couldn't read that document.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
