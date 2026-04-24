import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  const userId = typeof body?.userId === "string" ? body.userId : "";
  const role = body?.role === "admin" ? "admin" : "";
  if (!userId || !role) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectDB();
  const targetUser = await User.findById(userId);
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  targetUser.role = "admin";
  await targetUser.save();

  return NextResponse.json({ message: `${targetUser.name} is now an admin.` });
}
