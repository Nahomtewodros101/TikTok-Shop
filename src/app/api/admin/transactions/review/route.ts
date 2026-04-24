import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Transaction } from "@/models/Transaction";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { verifySameOrigin } from "@/lib/requestGuards";
import { AuditLog } from "@/models/AuditLog";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { transactionId, status } = await req.json();
  await connectDB();
  const tx = await Transaction.findByIdAndUpdate(transactionId, { status }, { new: true });
  if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  const user = await User.findById(tx.userId);
  if (status === "accepted" && user) {
    if (tx.type === "withdrawal") user.balance -= tx.amount;
    if (tx.type === "deposit") user.balance += tx.amount;
    await user.save();
  }
  await Notification.create({ userId: tx.userId, message: `Your transaction ${tx._id} is ${status}.` });
  await AuditLog.create({
    actorUserId: guard.session.userId,
    action: "ADMIN_REVIEW_TRANSACTION",
    targetId: String(tx._id),
    details: `status=${status}`
  });
  if (user?.email) await sendEmail(user.email, "Transaction status updated", `Your transaction is ${status}.`);
  return NextResponse.json({ message: "Transaction reviewed" });
}
