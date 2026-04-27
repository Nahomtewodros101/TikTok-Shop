import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { TaskCompletion } from "@/models/TaskCompletion";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireSession();
  if ("error" in guard) return guard.error;

  const { completionId, clearAll } = await req.json();

  await connectDB();
  if (clearAll === true) {
    const result = await TaskCompletion.updateMany(
      { userId: guard.session.userId, deletedAt: null },
      { deletedAt: new Date() }
    );
    return NextResponse.json({ message: `Removed ${result.modifiedCount} completed task(s)` });
  }

  if (!isNonEmptyString(completionId)) {
    return NextResponse.json({ error: "Invalid completion id" }, { status: 400 });
  }
  const deleted = await TaskCompletion.findOneAndUpdate(
    { _id: completionId, userId: guard.session.userId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!deleted) return NextResponse.json({ error: "Completed task not found" }, { status: 404 });
  return NextResponse.json({ message: "Completed task removed" });
}
