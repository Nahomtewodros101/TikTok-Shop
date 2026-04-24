import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Task } from "@/models/Task";
import { Transaction } from "@/models/Transaction";
import { Notification } from "@/models/Notification";
import { TaskCompletion } from "@/models/TaskCompletion";
import { DashboardClient } from "./userClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");
  await connectDB();

  const user = await User.findById(session.userId).lean();
  const completions = await TaskCompletion.find({ userId: session.userId }).sort({ createdAt: -1 }).lean();
  const completedTaskIds = completions.map((c: any) => c.taskId);
  const tasks = await Task.find({ isActive: true, _id: { $nin: completedTaskIds } }).lean();
  const completedTasksRaw = await Task.find({ _id: { $in: completedTaskIds } }).lean();
  const completedTaskMap = new Map(completedTasksRaw.map((t: any) => [String(t._id), t]));
  const completedTasks = completions.map((c: any) => {
    const task = completedTaskMap.get(String(c.taskId));
    return {
      _id: String(c._id),
      taskId: String(c.taskId),
      title: task?.title || "Task",
      type: task?.type || "normal",
      reward: Number(task?.reward || 0),
      imageUrl: task?.imageUrl || "",
      completedAt: c.createdAt
    };
  });
  const txs = await Transaction.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(15).lean();
  const notifications = await Notification.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(20).lean();

  return (
    <main className="container dashboard-shell" style={{ marginTop: 24 }}>
      <DashboardClient
        user={JSON.parse(JSON.stringify(user))}
        tasks={JSON.parse(JSON.stringify(tasks))}
        completedTasks={JSON.parse(JSON.stringify(completedTasks))}
        txs={JSON.parse(JSON.stringify(txs))}
        notifications={JSON.parse(JSON.stringify(notifications))}
      />
    </main>
  );
}
