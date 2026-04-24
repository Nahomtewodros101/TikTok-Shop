"use client";

import { useState } from "react";

export function ProfileForm({ user }: { user: any }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, currentPassword, newPassword, confirmNewPassword })
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }

  return (
    <div className="grid">
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <label className="dashboard-subtle">Your current password</label>
      <div className="password-row">
        <input
          className="input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          type={showCurrentPassword ? "text" : "password"}
        />
        <button className="btn btn-outline-soft" type="button" onClick={() => setShowCurrentPassword((p) => !p)}>
          {showCurrentPassword ? "Hide" : "Show"}
        </button>
      </div>
      <div className="password-row">
        <input
          className="input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          type={showNewPassword ? "text" : "password"}
        />
        <button className="btn btn-outline-soft" type="button" onClick={() => setShowNewPassword((p) => !p)}>
          {showNewPassword ? "Hide" : "Show"}
        </button>
      </div>
      <div className="password-row">
        <input
          className="input"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="Confirm new password"
          type={showConfirmPassword ? "text" : "password"}
        />
        <button className="btn btn-outline-soft" type="button" onClick={() => setShowConfirmPassword((p) => !p)}>
          {showConfirmPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button className="btn" onClick={save}>
        Save
      </button>
      <p>{msg}</p>
    </div>
  );
}
