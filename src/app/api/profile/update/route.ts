import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { User } from "@/models/User";
import { compareSecret, hashSecret, sanitizeText } from "@/lib/security";
import { isStrongPassword } from "@/lib/validation";

export async function POST(req: Request) {
  const guard = await requireSession();
  if ("error" in guard) return guard.error;
  const { name, email, phone, currentPassword, newPassword, confirmNewPassword } = await req.json();
  await connectDB();
  const user = await User.findById(guard.session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const update: Record<string, unknown> = {
    name: sanitizeText(name || ""),
    email: sanitizeText(email || ""),
    phone: sanitizeText(phone || "")
  };

  const wantsPasswordChange =
    typeof currentPassword === "string" ||
    typeof newPassword === "string" ||
    typeof confirmNewPassword === "string";

  if (wantsPasswordChange) {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ error: "Current password, new password, and confirm password are required" }, { status: 400 });
    }
    if (!isStrongPassword(newPassword)) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }
    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ error: "New password confirmation does not match" }, { status: 400 });
    }
    const matches = await compareSecret(currentPassword, user.passwordHash);
    if (!matches) {
      return NextResponse.json({ error: "Your current password is incorrect" }, { status: 400 });
    }
    update.passwordHash = await hashSecret(newPassword);
  }

  await User.findByIdAndUpdate(guard.session.userId, update);
  return NextResponse.json({ message: "Profile updated" });
}
