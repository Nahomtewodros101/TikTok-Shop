"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ 
  user, 
  tasks = [], 
  completedTasks = [], 
  txs = [], 
  notifications = [] 
}: {
  user: any;
  tasks: any[];
  completedTasks: any[];
  txs: any[];
  notifications: any[];
}) {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [support, setSupport] = useState({ email: "", reason: "technical", message: "" });
  const [tx, setTx] = useState({ type: "deposit", amount: 0, screenshotUrl: "" });
  const [receiptName, setReceiptName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");
  const [invitationKey, setInvitationKey] = useState("");
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});

  const txSectionRef = useRef<HTMLDivElement>(null);

  const percentage = useMemo(() => {
    const completed = user?.dailyTaskCompleted || 0;
    return Math.min(100, Math.round((completed / 40) * 100));
  }, [user?.dailyTaskCompleted]);

  // Safely set email when user data is available
  useEffect(() => {
    if (user?.email) {
      setSupport(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  // Loading state
  if (!user) {
    return (
      <div className="card dashboard-panel" style={{ textAlign: "center", padding: "80px 20px" }}>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  async function sendSupport() {
    const res = await fetch("/api/support/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...support, 
        name: user.name || "Unknown User" 
      })
    });
    
    const data = await res.json();
    setMessage(data.message || data.error);
  
    if (res.ok) {
      setSupport({
        email: user.email || "",
        reason: "technical",
        message: ""
      });
      router.refresh();
    }
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
  
    if (res.ok) {
      setTx({ type: "deposit", amount: 0, screenshotUrl: "" });
      setReceiptName("");

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      router.refresh();
    }
  }

  async function uploadReceipt(file?: File) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setTaskStatus("Please choose an image under 3MB.");
      setMessage("Receipt image is too large. Max size is 3MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      const res = await fetch("/api/uploads/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dataUrl: String(reader.result || ""), 
          fileName: file.name 
        })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        setTx((p) => ({ ...p, screenshotUrl: data.url }));
        setReceiptName(file.name);
      }

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
      setTaskStatus(`Special task locked. Deposit proof of at least $${requiredDeposit} is required.`);
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
      setMessage("Could not copy automatically. Please copy manually.");
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

  async function deleteTransaction(transactionId: string) {
    const res = await fetch("/api/transactions/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  async function clearTransactionHistory() {
    const res = await fetch("/api/transactions/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.refresh();
  }

  return (
    <section className="dashboard-grid">
      {/* User Summary */}
      <div className="card dashboard-panel">
        <h2>User Dashboard</h2>
        <div className="dashboard-stat-grid">
          <p className="dashboard-stat-chip">Balance: ${user.balance || 0}</p>
          <p className="dashboard-stat-chip">
            Remaining tasks: {Math.max(0, 40 - (user.dailyTaskCompleted || 0))}
          </p>
        </div>
        {(user.dailyTaskCompleted || 0) >= 40 && (
          <p className="dashboard-subtle">You reached the max amount of tasks in this 24h window.</p>
        )}
      </div>

      {/* Available Tasks */}
      <div className="card dashboard-panel">
        <h3>Available Tasks</h3>
        <div className="dashboard-list">
          {tasks.length === 0 && <p className="dashboard-subtle">No available tasks right now.</p>}
          {tasks.map((t: any) => (
            <div key={t._id} className="dashboard-row dashboard-task-card">
              {t.imageUrl && <img src={t.imageUrl} alt={t.title} className="dashboard-task-image" />}
              <div className="dashboard-task-content">
                <p className="dashboard-row-title">{t.title}</p>
                <p className="dashboard-subtle">
                  {t.type} task - reward ${t.reward}
                  {t.type === "special" && ` (deposit required: $${t.requiredDeposit})`}
                </p>
                <p className="dashboard-subtle">
                  Question: {t.question || "Describe what is shown in this task image."}
                </p>
                <input
                  className="input"
                  placeholder="Type your answer"
                  value={taskAnswers[t._id] || ""}
                  onChange={(e) => setTaskAnswers((p) => ({ ...p, [t._id]: e.target.value }))}
                />
              </div>
              <button 
                className="btn" 
                onClick={() => completeTask(t._id, t.type, Number(t.requiredDeposit || 0))}
              >
                Submit Answer & Complete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="card dashboard-panel">
        <h3>Completed Tasks</h3>
        <button className="btn btn-outline-soft" onClick={clearCompletedTasks}>
          Delete All Completed Tasks
        </button>
        <div className="dashboard-list">
          {completedTasks.length === 0 && <p className="dashboard-subtle">No completed tasks yet.</p>}
          {completedTasks.map((t: any) => (
            <div key={t._id} className="dashboard-row dashboard-task-card">
              {t.imageUrl && <img src={t.imageUrl} alt={t.title} className="dashboard-task-image" />}
              <div className="dashboard-task-content">
                <p className="dashboard-row-title">{t.title}</p>
                <p className="dashboard-subtle">{t.type} - reward ${t.reward}</p>
                <p className="dashboard-subtle">
                  Completed: {new Date(t.completedAt).toLocaleString()}
                </p>
              </div>
              <button 
                className="btn btn-outline-soft" 
                onClick={() => deleteCompletedTask(t._id)}
              >
                Delete Completed Task
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit / Transaction Section */}
      <div className="card dashboard-panel" ref={txSectionRef}>
        <h3>Deposit / Withdraw / Proof Upload</h3>
        <select 
          className="select" 
          value={tx.type} 
          onChange={(e) => setTx((p) => ({ ...p, type: e.target.value }))}
        >
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="special-proof">Special Task Proof</option>
        </select>

        <input 
          className="input" 
          type="number" 
          placeholder="Amount" 
          value={tx.amount || ""} 
          onChange={(e) => setTx((p) => ({ ...p, amount: Number(e.target.value) }))} 
        />

        <input 
          className="input" 
          type="file" 
          accept="image/*" 
          onChange={(e) => uploadReceipt(e.target.files?.[0])} 
        />

        {receiptName && <p className="dashboard-subtle">Selected proof file: {receiptName}</p>}
        {uploading && <p className="dashboard-subtle">Uploading receipt...</p>}
        {taskStatus && <p className="dashboard-subtle">{taskStatus}</p>}

        <button className="btn" onClick={createTx}>Submit</button>
      </div>

      {/* Support Chat */}
      <div className="card dashboard-panel">
        <h3>Support Chat</h3>
        <input 
          className="input" 
          placeholder="Email" 
          value={support.email} 
          onChange={(e) => setSupport((p) => ({ ...p, email: e.target.value }))} 
        />
        <select 
          className="select" 
          value={support.reason} 
          onChange={(e) => setSupport((p) => ({ ...p, reason: e.target.value }))}
        >
          <option value="technical">Technical</option>
          <option value="payment">Payment</option>
          <option value="security">Security</option>
        </select>
        <textarea 
          className="textarea" 
          placeholder="Message" 
          value={support.message} 
          onChange={(e) => setSupport((p) => ({ ...p, message: e.target.value }))} 
        />
        <button className="btn" onClick={sendSupport}>Send to Support</button>
        {message && <p className="dashboard-subtle">{message}</p>}
      </div>

      {/* Transaction History */}
      <div className="card dashboard-panel">
        <h3>Transaction History</h3>
        <button className="btn btn-outline-soft" onClick={clearTransactionHistory}>
          Delete All Transaction History
        </button>
        <div className="dashboard-list">
          {txs.map((t: any) => (
            <div key={t._id} className="dashboard-row">
              <p className="dashboard-subtle">{t.type} ${t.amount} - {t.status}</p>
              <button 
                className="btn btn-outline-soft" 
                onClick={() => deleteTransaction(t._id)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Notifications */}
      <div className="card dashboard-panel">
        <h3>Admin Notifications</h3>
        <button className="btn btn-outline-soft" onClick={clearSeenNotifications}>
          Delete Seen Notifications
        </button>
        <div className="dashboard-list">
          {notifications.length === 0 && <p className="dashboard-subtle">No notifications yet.</p>}
          {notifications.map((n: any) => (
            <div key={n._id} className="dashboard-row">
              <p className="dashboard-subtle">{n.message}</p>
              <button 
                className="btn btn-outline-soft" 
                onClick={() => deleteNotification(n._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invitation Key */}
      <div className="card dashboard-panel">
        <h3>Generated Invitation Key</h3>
        <p className="dashboard-subtle">Generate a key and copy it to invite a user.</p>
        <button className="btn" onClick={generateKey}>Generate Invitation Key</button>
        <input 
          className="input" 
          value={invitationKey} 
          readOnly 
          placeholder="Generated invitation key will appear here" 
        />
        <button 
          className="btn btn-outline-soft" 
          onClick={copyInvitationKey} 
          disabled={!invitationKey}
        >
          Copy Key
        </button>
      </div>
    </section>
  );
}