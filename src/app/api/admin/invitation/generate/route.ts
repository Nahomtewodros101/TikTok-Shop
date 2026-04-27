import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { User } from "@/models/User";
import { generateInviteKey } from "@/lib/security";

export async function POST() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  await connectDB();
  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteKey = generateInviteKey("INV");
    try {
      await User.findByIdAndUpdate(guard.session.userId, { inviteKey });
      return NextResponse.json({ message: "Invitation key generated", inviteKey });
    } catch (error: any) {
      if (error?.code !== 11000 || attempt === 4) throw error;
    }
  }

  return NextResponse.json({ error: "Could not generate unique invitation key" }, { status: 500 });
}
