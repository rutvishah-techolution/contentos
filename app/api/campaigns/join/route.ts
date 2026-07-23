import { NextRequest, NextResponse } from "next/server";
import { joinCampaign } from "@/lib/brain";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    const { code } = await req.json();
    const slug = await joinCampaign(String(code || ""), session.user.id);
    return NextResponse.json({ slug });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Join failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
