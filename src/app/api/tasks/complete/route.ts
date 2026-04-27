import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/guards";
import { User } from "@/models/User";
import { Task } from "@/models/Task";
import { Transaction } from "@/models/Transaction";
import { TaskCompletion } from "@/models/TaskCompletion";
import { verifySameOrigin } from "@/lib/requestGuards";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(req: Request) {
  const origin = verifySameOrigin(req);
  if (!origin.ok) return origin.response;
  const guard = await requireSession();
  if ("error" in guard) return guard.error;
  const { taskId, answer } = await req.json();
  if (!isNonEmptyString(answer)) {
    return NextResponse.json({ error: "Please answer the task question before completion." }, { status: 400 });
  }
  await connectDB();
  const user = await User.findById(guard.session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const task = await Task.findById(taskId);
  if (!task || !task.isActive || task.deletedAt) return NextResponse.json({ error: "Task not available" }, { status: 400 });
  const existingCompletion = await TaskCompletion.findOne({ userId: user._id, taskId: task._id });
  if (existingCompletion) {
    return NextResponse.json({ error: "Task already completed. Remove it from completed tasks to retry." }, { status: 400 });
  }

  const now = Date.now();
  const start = new Date(user.taskWindowStart).getTime();
  if (now - start > 24 * 60 * 60 * 1000) {
    user.taskWindowStart = new Date();
    user.dailyTaskCompleted = 0;
  }
  if (user.dailyTaskCompleted >= 40) {
    return NextResponse.json({ error: "Max tasks reached in 24 hours" }, { status: 400 });
  }
  if (task.type === "special") {
    const proof = await Transaction.findOne({
      userId: user._id,
      type: "special-proof",
      status: "accepted",
      amount: { $gte: task.requiredDeposit },
      consumedForTaskId: null
    }).sort({ createdAt: 1 });
    if (!proof) {
      return NextResponse.json(
        {
          error: `Accepted special-task deposit proof of at least $${Number(task.requiredDeposit || 0)} is required for this task.`,
          requiresSpecialDeposit: true,
          requiredDeposit: Number(task.requiredDeposit || 0),
          taskId: String(task._id)
        },
        { status: 400 }
      );
    }
    proof.consumedForTaskId = task._id;
    await proof.save();
  }
  user.dailyTaskCompleted += 1;
  user.balance += task.reward;
  await user.save();
  await TaskCompletion.create({ userId: user._id, taskId: task._id, answer: answer.trim() });
  return NextResponse.json({ message: "Task completed", remaining: 40 - user.dailyTaskCompleted });
}
