"use client";

import { useState } from "react";

export function ProfileForm({ user }: { user: any }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function save() {
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  }

  return (
    <div className="grid">
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (optional)" type="password" />
      <button className="btn" onClick={save}>
        Save
      </button>
      <p>{msg}</p>
    </div>
  );
}
