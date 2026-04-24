import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";
import { AuditLog } from "@/models/AuditLog";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { userId, message } = await req.json();
  if (!isNonEmptyString(userId) || !isNonEmptyString(message, 1000)) {
    return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
  }
  await connectDB();
  await Notification.create({ userId, message });
  await AuditLog.create({ actorUserId: guard.session.userId, action: "ADMIN_NOTIFY_USER", targetId: userId, details: message });
  const user = await User.findById(userId);
  if (user?.email) await sendEmail(user.email, "New admin notification", message);
  return NextResponse.json({ message: "Notification sent" });
}
