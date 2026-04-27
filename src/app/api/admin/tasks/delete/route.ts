import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { Task } from "@/models/Task";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  const { taskId, clearAll } = await req.json();
  await connectDB();

  if (clearAll === true) {
    const result = await Task.updateMany(
      { deletedAt: null },
      { deletedAt: new Date(), isActive: false }
    );
    return NextResponse.json({ message: `Removed ${result.modifiedCount} task(s)` });
  }

  if (!isNonEmptyString(taskId)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const updated = await Task.findOneAndUpdate(
    { _id: taskId, deletedAt: null },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ message: "Task removed from history" });
}
