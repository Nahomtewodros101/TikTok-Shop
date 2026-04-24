"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardClient({ user, tasks, completedTasks, txs, notifications }: { user: any; tasks: any[]; completedTasks: any[]; txs: any[]; notifications: any[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [support, setSupport] = useState({ email: user.email || "", reason: "technical", message: "" });
  const [tx, setTx] = useState({ type: "deposit", amount: 0, screenshotUrl: "" });
  const [receiptName, setReceiptName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");
  const [invitationKey, setInvitationKey] = useState("");
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});
  const txSectionRef = useRef<HTMLDivElement | null>(null);
  const percentage = useMemo(() => Math.min(100, Math.round((user.dailyTaskCompleted / 40) * 100)), [user.dailyTaskCompleted]);

  async function sendSupport() {
    const res = await fetch("/api/support/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...support, name: user.name })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  }

  async function generateKey() {
    const res = await fetch("/api/invitation/generate", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.inviteKey) {
      setInvitationKey(data.inviteKey);
      setMessage("Invitation key generated.");
      router.refresh();
      return;
    }
    setMessage(data.error || data.message || "Could not generate invitation key");
  }

  async function createTx() {
    const res = await fetch("/api/transactions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setTaskStatus(res.ok ? "Transaction submitted. Await admin review." : data.error || "Could not submit transaction.");
    if (res.ok) router.refresh();
  }

  async function uploadReceipt(file?: File) {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/uploads/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: String(reader.result || ""), fileName: file.name })
      });
      const data = await res.json();
      if (res.ok) setTx((p) => ({ ...p, screenshotUrl: data.url }));
      if (res.ok) setReceiptName(file.name);
      setMessage(data.url ? `Uploaded: ${data.url}` : data.error || "Upload failed");
      setTaskStatus(res.ok ? "Deposit proof uploaded successfully." : data.error || "Proof upload failed.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  async function completeTask(taskId: string, taskType: string, requiredDeposit: number) {
    const answer = (taskAnswers[taskId] || "").trim();
    if (!answer) {
      setMessage("Please answer the task question before completing.");
      return;
    }
    const res = await fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, answer })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (!res.ok && taskType === "special" && data.requiresSpecialDeposit) {
      setTaskStatus(`Special task locked. Deposit proof of at least $${requiredDeposit} is required and must be accepted by admin.`);
      setTx((p) => ({ ...p, type: "special-proof", amount: requiredDeposit }));
      txSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setTaskStatus(res.ok ? "Task completed successfully." : data.error || "Task submission failed.");
    if (res.ok) {
      setTaskAnswers((p) => ({ ...p, [taskId]: "" }));
      router.refresh();
    }
  }
  
  async function copyInvitationKey() {
    if (!invitationKey) return;
    try {
      await navigator.clipboard.writeText(invitationKey);
      setMessage("Invitation key copied. Share it with the user.");
    } catch {
      setMessage("Could not copy automatically. Please copy the key manually.");
    }
  }

  async function deleteNotification(notificationId: string) {
    const res = await fetch("/api/notifications/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  async function clearSeenNotifications() {
    const res = await fetch("/api/notifications/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearSeen: true })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  async function deleteCompletedTask(completionId: string) {
    const res = await fetch("/api/tasks/completed/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completionId })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  async function clearCompletedTasks() {
    const res = await fetch("/api/tasks/completed/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  return (
    <section className="grid two dashboard-grid dashboard-user-grid">
      <div className="card dashboard-panel">
        <h2>User Dashboard</h2>
        <div className="dashboard-stat-grid">
          <p className="dashboard-stat-chip">Balance: ${user.balance}</p>
          <p className="dashboard-stat-chip">Remaining tasks: {Math.max(0, 40 - user.dailyTaskCompleted)}</p>
        </div>
        {user.dailyTaskCompleted >= 40 && <p className="dashboard-subtle">You reached the max amount of tasks in this 24h window.</p>}
      </div>
      <div className="card dashboard-panel">
        <h3>Available Tasks</h3>
        <div className="dashboard-list">
          {tasks.length === 0 && <p className="dashboard-subtle">No available tasks right now.</p>}
          {tasks.map((t) => (
            <div key={t._id} className="dashboard-row dashboard-task-card">
              {t.imageUrl && <img src={t.imageUrl} alt={t.title} className="dashboard-task-image" />}
              <div>
                <p className="dashboard-row-title">{t.title}</p>
                <p className="dashboard-subtle">
                  {t.type} task - reward ${t.reward}
                  {t.type === "special" && ` (deposit required: $${t.requiredDeposit})`}
                </p>
                <p className="dashboard-subtle">Question: {t.question || "Describe what is shown in this task image."}</p>
                <input
                  className="input"
                  placeholder="Type your answer"
                  value={taskAnswers[t._id] || ""}
                  onChange={(e) => setTaskAnswers((p) => ({ ...p, [t._id]: e.target.value }))}
                />
              </div>
              <button className="btn" onClick={() => completeTask(t._id, t.type, Number(t.requiredDeposit || 0))}>Submit Answer & Complete</button>
            </div>
          ))}
        </div>
      </div>
      <div className="card dashboard-panel">
        <h3>Completed Tasks</h3>
        <button className="btn btn-outline-soft" onClick={clearCompletedTasks}>Delete All Completed Tasks</button>
        <div className="dashboard-list">
          {completedTasks.length === 0 && <p className="dashboard-subtle">No completed tasks yet.</p>}
          {completedTasks.map((t) => (
            <div key={t._id} className="dashboard-row dashboard-task-card">
              {t.imageUrl && <img src={t.imageUrl} alt={t.title} className="dashboard-task-image" />}
              <div>
                <p className="dashboard-row-title">{t.title}</p>
                <p className="dashboard-subtle">{t.type} - reward ${t.reward}</p>
                <p className="dashboard-subtle">Completed: {new Date(t.completedAt).toLocaleString()}</p>
              </div>
              <button className="btn btn-outline-soft" onClick={() => deleteCompletedTask(t._id)}>Delete Completed Task</button>
            </div>
          ))}
        </div>
      </div>
      <div className="card dashboard-panel" ref={txSectionRef}>
        <h3>Deposit / Withdraw / Proof Upload</h3>
        <select className="select" value={tx.type} onChange={(e) => setTx((p) => ({ ...p, type: e.target.value }))}>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="special-proof">Special Task Proof</option>
        </select>
        <input className="input" type="number" placeholder="Amount" onChange={(e) => setTx((p) => ({ ...p, amount: Number(e.target.value) }))} />
        <input className="input" type="file" accept="image/*" onChange={(e) => uploadReceipt(e.target.files?.[0])} />
        {receiptName && <p className="dashboard-subtle">Selected proof file: {receiptName}</p>}
        {uploading && <p className="dashboard-subtle">Uploading receipt...</p>}
        {taskStatus && <p className="dashboard-subtle">{taskStatus}</p>}
        <button className="btn" onClick={createTx}>Submit</button>
      </div>
      <div className="card dashboard-panel">
        <h3>Support Chat</h3>
        <input className="input" placeholder="Email" value={support.email} onChange={(e) => setSupport((p) => ({ ...p, email: e.target.value }))} />
        <select className="select" value={support.reason} onChange={(e) => setSupport((p) => ({ ...p, reason: e.target.value }))}>
          <option value="technical">Technical</option>
          <option value="payment">Payment</option>
          <option value="security">Security</option>
        </select>
        <textarea className="textarea" placeholder="Message" value={support.message} onChange={(e) => setSupport((p) => ({ ...p, message: e.target.value }))} />
        <button className="btn" onClick={sendSupport}>Send to Support</button>
        <p className="dashboard-subtle">{message}</p>
      </div>
      <div className="card dashboard-panel">
        <h3>Transaction History</h3>
        <div className="dashboard-list">
          {txs.map((t) => (
            <div key={t._id} className="dashboard-row">
              <p className="dashboard-subtle">{t.type} ${t.amount} - {t.status}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card dashboard-panel">
        <h3>Admin Notifications</h3>
        <button className="btn btn-outline-soft" onClick={clearSeenNotifications}>Delete Seen Notifications</button>
        <div className="dashboard-list">
          {notifications.length === 0 && <p className="dashboard-subtle">No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n._id} className="dashboard-row">
              <p className="dashboard-subtle">{n.message}</p>
              <button className="btn btn-outline-soft" onClick={() => deleteNotification(n._id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      <div className="card dashboard-panel">
        <h3>Generated Invitation Key</h3>
        <p className="dashboard-subtle">Generate a key and copy it to invite a user.</p>
        <button className="btn" onClick={generateKey}>Generate Invitation Key</button>
        <input className="input" value={invitationKey} readOnly placeholder="Generated invitation key will appear here" style={{ marginTop: 10 }} />
        <button className="btn btn-outline-soft" onClick={copyInvitationKey} disabled={!invitationKey}>Copy Key</button>
      </div>
    </section>
  );
}
