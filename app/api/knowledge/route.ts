import { NextRequest, NextResponse } from "next/server";
import { listKnowledge, saveKnowledgeDoc } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

export async function GET() {
  const docs = await listKnowledge();
  return NextResponse.json({ docs });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const doc = await saveKnowledgeDoc(file.name, buffer);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
