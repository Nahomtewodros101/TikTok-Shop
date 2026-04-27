import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Transaction } from "@/models/Transaction";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { transactionId, clearAll } = await req.json();
  await connectDB();

  if (clearAll === true) {
    const result = await Transaction.updateMany(
      { deletedByAdmin: { $ne: true } },
      { deletedByAdmin: true }
    );
    return NextResponse.json({ message: `Removed ${result.modifiedCount} transaction(s)` });
  }

  if (!isNonEmptyString(transactionId)) {
    return NextResponse.json({ error: "Invalid transaction id" }, { status: 400 });
  }

  const updated = await Transaction.findByIdAndUpdate(
    transactionId,
    { deletedByAdmin: true },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  return NextResponse.json({ message: "Transaction removed from admin history" });
}
