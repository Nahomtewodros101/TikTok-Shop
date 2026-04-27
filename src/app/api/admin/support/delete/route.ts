import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { SupportMessage } from "@/models/SupportMessage";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { messageId, clearAll } = await req.json();
  await connectDB();

  if (clearAll === true) {
    const result = await SupportMessage.updateMany(
      { deletedByAdmin: { $ne: true } },
      { deletedByAdmin: true }
    );
    return NextResponse.json({ message: `Removed ${result.modifiedCount} support message(s)` });
  }

  if (!isNonEmptyString(messageId)) {
    return NextResponse.json({ error: "Invalid support message id" }, { status: 400 });
  }

  const updated = await SupportMessage.findByIdAndUpdate(
    messageId,
    { deletedByAdmin: true },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Support message not found" }, { status: 404 });
  return NextResponse.json({ message: "Support message removed from admin history" });
}
