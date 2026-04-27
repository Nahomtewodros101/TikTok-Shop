import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { SupportMessage } from "@/models/SupportMessage";
import { AdminClient } from "./adminClient";
import { Task } from "@/models/Task";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");
  await connectDB();

  const users = await User.find().sort({ createdAt: -1 }).lean();
  const txs = await Transaction.find({ deletedByAdmin: { $ne: true } }).sort({ createdAt: -1 }).limit(50).lean();
  const messages = await SupportMessage.find({ deletedByAdmin: { $ne: true } }).sort({ createdAt: -1 }).limit(50).lean();
  const tasks = await Task.find({ deletedAt: null }).sort({ createdAt: -1 }).lean();
  const totalAmount = txs.reduce((sum, t: any) => sum + Number(t.amount || 0), 0);

  return (
    <main className="container dashboard-shell" style={{ marginTop: 24 }}>
      <AdminClient
        users={JSON.parse(JSON.stringify(users))}
        txs={JSON.parse(JSON.stringify(txs))}
        messages={JSON.parse(JSON.stringify(messages))}
        tasks={JSON.parse(JSON.stringify(tasks))}
        stats={{ users: users.length, txCount: txs.length, totalAmount }}
      />
    </main>
  );
}
