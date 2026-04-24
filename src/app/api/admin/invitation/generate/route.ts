import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { User } from "@/models/User";
import { generateInviteKey } from "@/lib/security";

export async function POST() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  await connectDB();
  const inviteKey = generateInviteKey("INV");
  await User.findByIdAndUpdate(guard.session.userId, { inviteKey });

  return NextResponse.json({ message: "Invitation key generated", inviteKey });
}
