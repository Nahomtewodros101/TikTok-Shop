"use client";

import { useState } from "react";

export function SetupClient() {
  const [inviteKey, setInviteKey] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    withdrawalPassword: ""
  });

  async function generateKey() {
    const res = await fetch("/api/setup/generate-invite-key");
    const data = await res.json();
    if (res.ok) {
      setInviteKey(data.inviteKey);
      setMsg(`Invite key generated: ${data.inviteKey}`);
    } else {
      setMsg(data.error || "Could not generate invite key");
    }
  }

  async function bootstrapAdmin() {
    const res = await fetch("/api/setup/bootstrap-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, invitationKey: inviteKey })
    });
    const data = await res.json();
    setMsg(data.message || data.error || "Done");
    if (res.ok && data.inviteKey) setInviteKey(data.inviteKey);
  }

  async function seedTasks() {
    const res = await fetch("/api/setup/seed-tasks", { method: "POST" });
    const data = await res.json();
    setMsg(data.message || data.error || "Done");
  }
  
  return (
    <section className="grid two">
      <div className="card">
        <h3> Generate Initial Invite Key</h3>
        <button className="btn" onClick={generateKey}>
          Generate Invite Key
        </button>
        <p>{inviteKey ? `Current key: ${inviteKey}` : "No key generated yet"}</p>
      </div>

      <div className="card mt-2 p-2">
        <h3> Bootstrap First Admin</h3>
        <input className="input" placeholder="Admin name" onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <input className="input" placeholder="Admin phone" onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input className="input" type="password" placeholder="Login password" onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <input
          className="input"
          type="password"
          placeholder="Withdrawal password"
          onChange={(e) => setForm((p) => ({ ...p, withdrawalPassword: e.target.value }))}
        />
        <button className="btn" onClick={bootstrapAdmin}>
          Create Admin
        </button>
      </div>

      <div className="card mt-2">
        <h3> Seed Starter Tasks</h3>
        <button className="btn" onClick={seedTasks}>
          Seed Tasks
        </button>
      </div>

      <div className="card mt-2">
        <h3>Status</h3>
        <p>{msg || "No action yet"}</p>
      </div>
    </section>
  );
}
