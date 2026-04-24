import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashSecret } from "@/lib/security";
import { isNonEmptyString, isPhone, isStrongPassword } from "@/lib/validation";

export async function POST(req: Request) {
  const { name, phone, password, withdrawalPassword, invitationKey } = await req.json();
  if (!isNonEmptyString(name) || !isPhone(phone) || !isStrongPassword(password) || !isStrongPassword(withdrawalPassword)) {
    return NextResponse.json({ error: "Invalid admin setup fields" }, { status: 400 });
  }
  await connectDB();
  const exists = await User.findOne({ role: "admin" });
  if (exists) return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
  const inviteKey = isNonEmptyString(invitationKey) ? invitationKey.trim() : process.env.ADMIN_INVITE_KEY || "ADMIN-FIRST-INVITE-KEY";
  const admin = await User.create({
    name: name.trim(),
    phone: phone.trim(),
    email: "",
    passwordHash: await hashSecret(password),
    withdrawalPasswordHash: await hashSecret(withdrawalPassword),
    role: "admin",
    inviteKey,
    balance: 0
  });
  return NextResponse.json({ message: "Admin created", adminId: String(admin._id), inviteKey });
}
