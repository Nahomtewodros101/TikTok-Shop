"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminStatsChart } from "@/components/AdminStatsChart";
import { LogoutButton } from "@/components/LogoutButton";

export function AdminClient({
  users,
  txs,
  messages,
  tasks,
  stats
}: {
  users: any[];
  txs: any[];
  messages: any[];
  tasks: any[];
  stats: { users: number; txCount: number; totalAmount: number };
}) {
  const router = useRouter();
  const [statusMsg, setStatusMsg] = useState("");
  const [inviteKey, setInviteKey] = useState("");
  const [notify, setNotify] = useState({ userId: "", message: "" });
  const [taskForm, setTaskForm] = useState({ title: "", imageUrl: "", question: "", type: "normal", reward: 1, requiredDeposit: 0 });

  async function updateTx(id: string, status: "accepted" | "declined") {
    const res = await fetch("/api/admin/transactions/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: id, status })
    });
    const data = await res.json();
    setStatusMsg(data.message || data.error);
    if (res.ok) router.refresh();
  }

  async function sendNotification() {
    const res = await fetch("/api/admin/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notify)
    });
    const data = await res.json();
    setStatusMsg(data.message || data.error);
    if (res.ok) setNotify((p) => ({ ...p, message: "" }));
  }

  async function createTask() {
    const res = await fetch("/api/admin/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskForm)
    });
    const data = await res.json();
    setStatusMsg(data.message || data.error);
    if (res.ok) {
      setTaskForm({ title: "", imageUrl: "", question: "", type: "normal", reward: 1, requiredDeposit: 0 });
      router.refresh();
    }
  }

  async function toggleTask(taskId: string, isActive: boolean) {
    const res = await fetch("/api/admin/tasks/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, isActive: !isActive })
    });
    const data = await res.json();
    setStatusMsg(data.message || data.error);
    if (res.ok) router.refresh();
  }

  async function generateInvitationKey() {
    const res = await fetch("/api/admin/invitation/generate", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.inviteKey) {
      setInviteKey(data.inviteKey);
      router.refresh();
    }
    setStatusMsg(data.message || data.error);
  }

  async function copyInvitationKey() {
    if (!inviteKey) return;
    try {
      await navigator.clipboard.writeText(inviteKey);
      setStatusMsg("Invitation key copied. Share it with the user.");
    } catch {
      setStatusMsg("Could not copy automatically. Please copy the key manually.");
    }
  }

  async function assignAdmin(userId: string) {
    const res = await fetch("/api/admin/users/assign-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: "admin" })
    });
    const data = await res.json();
    setStatusMsg(data.message || data.error);
    if (res.ok) router.refresh();
  }

  function pickUserForNotification(userId: string) {
    setNotify((p) => ({ ...p, userId }));
    setStatusMsg(`Selected user ID ${userId} for notification.`);
  }

  return (
    <section className="grid dashboard-grid dashboard-admin-grid">
      <div className="card dashboard-panel">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-stat-grid">
          <p className="dashboard-stat-chip">Users: {users.length}</p>
          <p className="dashboard-stat-chip">Transactions: {txs.length}</p>
          <p className="dashboard-stat-chip">Support Messages: {messages.length}</p>
        </div>
        <p className="dashboard-subtle">Admin Wallet: {process.env.NEXT_PUBLIC_ADMIN_WALLET || "Set NEXT_PUBLIC_ADMIN_WALLET in env"}</p>
        <div style={{ marginTop: 10 }}>
          <LogoutButton />
        </div>
      </div>
      <div className="card dashboard-panel">
        <AdminStatsChart users={stats.users} txCount={stats.txCount} totalAmount={stats.totalAmount} />
      </div>
      <div className="card dashboard-panel">
        <h3>User Invitation Key Generator</h3>
        <p className="dashboard-subtle">Generate a key, then copy/paste it to the user.</p>
        <button className="btn" onClick={generateInvitationKey}>Generate Key</button>{" "}
        <input className="input" value={inviteKey} readOnly placeholder="Generated invitation key will appear here" style={{ marginTop: 10 }} />
        <button className="btn btn-outline-soft" onClick={copyInvitationKey} disabled={!inviteKey}>Copy Key</button>
      </div>
      <div className="card dashboard-panel">
        <h3>Send Notification</h3>
        <input className="input" placeholder="User ID" value={notify.userId} onChange={(e) => setNotify((p) => ({ ...p, userId: e.target.value }))} />
        <input className="input" placeholder="Message" value={notify.message} onChange={(e) => setNotify((p) => ({ ...p, message: e.target.value }))} />
        <button className="btn" onClick={sendNotification}>Send</button>
        <p className="dashboard-subtle">{statusMsg}</p>
      </div>
      <div className="card dashboard-panel">
        <h3>User Role Management</h3>
        <p className="dashboard-subtle">Assign user accounts as admins from this list.</p>
        <div className="dashboard-list">
          {users.map((u) => (
            <div key={u._id} className="dashboard-row">
              <div>
                <p className="dashboard-row-title">{u.name}</p>
                <p className="dashboard-subtle">{u.phone} | role: {u.role} | joined: {new Date(u.joinedAt).toLocaleDateString()}</p>
                <p className="dashboard-subtle">User ID: {u._id}</p>
              </div>
              <div className="dashboard-action-group">
                <button className="btn btn-outline-soft" onClick={() => pickUserForNotification(u._id)}>
                  Use ID for Notification
                </button>
                {u.role !== "admin" && (
                  <button className="btn" onClick={() => assignAdmin(u._id)}>
                    Make Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card dashboard-panel">
        <h3>Transactions Review</h3>
        <div className="dashboard-list">
          {txs.map((t) => (
            <div key={t._id} className="dashboard-row">
              <p className="dashboard-subtle">
                {t.type} ${t.amount} by {t.userId} - {t.status}
              </p>
              {t.status === "pending" && (
                <div className="dashboard-action-group">
                  <button className="btn" onClick={() => updateTx(t._id, "accepted")}>Accept</button>{" "}
                  <button className="btn btn-outline-soft" onClick={() => updateTx(t._id, "declined")}>Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="card dashboard-panel">
        <h3>Support Inbox</h3>
        <div className="dashboard-list">
          {messages.map((m) => (
            <div key={m._id} className="dashboard-row">
              <p className="dashboard-subtle">{m.name} ({m.email}) - {m.reason}: {m.message}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card dashboard-panel">
        <h3>Create Task</h3>
        <input className="input" placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} />
        <input className="input" placeholder="Task Image URL (required)" value={taskForm.imageUrl} onChange={(e) => setTaskForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <input className="input" placeholder="Task Question (required)" value={taskForm.question} onChange={(e) => setTaskForm((p) => ({ ...p, question: e.target.value }))} />
        <select className="select" value={taskForm.type} onChange={(e) => setTaskForm((p) => ({ ...p, type: e.target.value }))}>
          <option value="normal">Normal</option>
          <option value="special">Special</option>
        </select>
        <input className="input" type="number" placeholder="Reward" value={taskForm.reward} onChange={(e) => setTaskForm((p) => ({ ...p, reward: Number(e.target.value) }))} />
        <input className="input" type="number" placeholder="Required Deposit (special)" value={taskForm.requiredDeposit} onChange={(e) => setTaskForm((p) => ({ ...p, requiredDeposit: Number(e.target.value) }))} />
        <button className="btn" onClick={createTask}>Create Task</button>
      </div>
      <div className="card dashboard-panel">
        <h3>Task Management</h3>
        <div className="dashboard-list">
          {tasks.map((t) => (
            <div key={t._id} className="dashboard-row">
              <p className="dashboard-subtle">
                {t.title} ({t.type}) reward ${t.reward} {t.isActive ? "active" : "inactive"}
              </p>
              <p className="dashboard-subtle">Image: {t.imageUrl || "N/A"} | Question: {t.question || "N/A"}</p>
              <button className="btn" onClick={() => toggleTask(t._id, t.isActive)}>{t.isActive ? "Disable" : "Enable"}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
