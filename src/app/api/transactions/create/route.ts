import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { verifySameOrigin } from "@/lib/requestGuards";
import { applyRateLimit } from "@/lib/rateLimit";
import { isAmount } from "@/lib/validation";
import { AuditLog } from "@/models/AuditLog";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireSession();
  if ("error" in guard) return guard.error;
  const limiter = applyRateLimit(`tx:${guard.session.userId}`, 20, 60_000);
  if (!limiter.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { type, amount, screenshotUrl } = await req.json();
  if (!["deposit", "withdrawal", "special-proof"].includes(type) || !isAmount(Number(amount))) {
    return NextResponse.json({ error: "Invalid transaction request" }, { status: 400 });
  }
  if (type === "special-proof" && (!screenshotUrl || typeof screenshotUrl !== "string")) {
    return NextResponse.json({ error: "Screenshot proof file is required for special task proof" }, { status: 400 });
  }
  await connectDB();
  const user = await User.findById(guard.session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (type === "withdrawal" && user.dailyTaskCompleted < 40) {
    return NextResponse.json({ error: "Complete 40 tasks before withdrawal" }, { status: 400 });
  }
  const autoAccept = type === "deposit";
  await Transaction.create({
    userId: user._id,
    type,
    amount: Number(amount),
    screenshotUrl: screenshotUrl || "",
    walletAddress: process.env.ADMIN_BINANCE_WALLET || "0xAdminWallet",
    status: autoAccept ? "accepted" : "pending"
  });
  await AuditLog.create({
    actorUserId: user._id,
    action: "USER_CREATE_TRANSACTION",
    details: `type=${type};amount=${Number(amount)}`
  });
  if (user.email) {
    const statusText = autoAccept ? "accepted" : "pending admin approval";
    await sendEmail(
      user.email,
      `${type} request submitted`,
      `Your ${type} request for $${Number(amount)} was submitted and is currently ${statusText}.`
    );
  }
  return NextResponse.json({ message: "Transaction submitted" });
}
