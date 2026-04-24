import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { Notification } from "@/models/Notification";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireSession();
  if ("error" in guard) return guard.error;

  const { notificationId, clearSeen } = await req.json();

  await connectDB();
  if (clearSeen === true) {
    const result = await Notification.deleteMany({ userId: guard.session.userId, isRead: true });
    return NextResponse.json({ message: `Removed ${result.deletedCount} seen notification(s)` });
  }

  if (!isNonEmptyString(notificationId)) {
    return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });
  }
  const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId: guard.session.userId });
  if (!deleted) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  return NextResponse.json({ message: "Notification removed" });
}
