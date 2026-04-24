import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { SupportMessage } from "@/models/SupportMessage";
import { bestStaticReply } from "@/lib/staticReplies";
import { sendEmail } from "@/lib/mailer";
import { applyRateLimit } from "@/lib/rateLimit";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isEmail, isNonEmptyString } from "@/lib/validation";
import { AuditLog } from "@/models/AuditLog";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireSession();
  if ("error" in guard) return guard.error;
  const limiter = applyRateLimit(`support:${guard.session.userId}`, 10, 60_000);
  if (!limiter.ok) return NextResponse.json({ error: "Too many support requests" }, { status: 429 });
  const { name, email, reason, message } = await req.json();
  if (!isNonEmptyString(name) || !isEmail(email) || !isNonEmptyString(reason) || !isNonEmptyString(message, 3000)) {
    return NextResponse.json({ error: "Invalid support payload" }, { status: 400 });
  }
  const autoReply = bestStaticReply(message || "");
  await connectDB();
  await SupportMessage.create({
    userId: guard.session.userId,
    name,
    email,
    reason,
    message,
    autoReply
  });
  await AuditLog.create({
    actorUserId: guard.session.userId,
    action: "USER_SUPPORT_MESSAGE",
    details: reason
  });
  await sendEmail(email, "Support message received", "Your message is received and our support team will contact you.");
  return NextResponse.json({ message: autoReply });
}
