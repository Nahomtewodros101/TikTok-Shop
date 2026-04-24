import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { User } from "@/models/User";
import { hashSecret, sanitizeText } from "@/lib/security";

export async function POST(req: Request) {
  const guard = await requireSession();
  if ("error" in guard) return guard.error;
  const { name, email, phone, password } = await req.json();
  await connectDB();
  const update: Record<string, unknown> = {
    name: sanitizeText(name || ""),
    email: sanitizeText(email || ""),
    phone: sanitizeText(phone || "")
  };
  if (password) update.passwordHash = await hashSecret(password);
  await User.findByIdAndUpdate(guard.session.userId, update);
  return NextResponse.json({ message: "Profile updated" });
}
