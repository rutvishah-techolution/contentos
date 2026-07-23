import { NextRequest, NextResponse } from "next/server";
import { createCampaign, listCampaigns } from "@/lib/brain";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const campaigns = await listCampaigns(session?.user?.id);
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    topic?: string;
    objective?: string;
    icp?: string;
    constraints?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const topic = (body.topic || "").trim();
  const objective = (body.objective || "").trim();
  const icp = (body.icp || "").trim();
  const constraints = (body.constraints || "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "Campaign name is required." },
      { status: 400 },
    );
  }
  if (!topic) {
    return NextResponse.json({ error: "Topic is required." }, { status: 400 });
  }

  const session = await auth();
  const campaign = await createCampaign(
    { name, topic, objective, icp, constraints },
    session?.user?.id || "",
  );
  return NextResponse.json({ campaign }, { status: 201 });
}
