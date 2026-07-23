import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth/users";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const user = await createUser(
      String(name || ""),
      String(email || ""),
      String(password || ""),
    );
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sign up failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
