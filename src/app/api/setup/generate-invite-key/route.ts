import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { generateInviteKey } from "@/lib/security";

// Only for fresh setup: generate first invite key if no users exist yet.
export async function GET() {
  await connectDB();
  const usersCount = await User.countDocuments();
  if (usersCount > 0) {
    return NextResponse.json({ error: "Setup invite generation is only allowed before first account creation." }, { status: 400 });
  }
  const inviteKey = generateInviteKey("ADMIN");
  return NextResponse.json({ inviteKey });
}
