"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const cyanAccent = "#00ff9d";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Authenticating...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        setMsg(data.error || "Login failed. Please try again.");
        return;
      }

      // Successful login
      setMsg("Login successful! Redirecting...");
      window.location.href = "/dashboard";
    } catch {
      setMsg("Network error. Please check your connection and try again.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glass-card">
        <div className="auth-header">
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "8px", color: "#fff" }}>
            Welcome <span style={{ color: cyanAccent }}>Back</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            Enter your credentials to access your secure tasks
          </p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="input-group">
            <label>Phone Number</label>
            <input 
              className="modern-input" 
              placeholder="e.g. 0712345678" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-container">
              <input 
                className="modern-input" 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button className="btn-mega" type="submit">
            Login to Dashboard
          </button>
          
          {msg && (
            <p className={`status-msg ${msg.includes('failed') || msg.includes('error') ? 'error' : 'info'}`}>
              {msg}
            </p>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: cyanAccent, fontWeight: "600", textDecoration: "none" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-page {
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(0, 255, 157, 0.12), transparent), 
                      linear-gradient(180deg, #1a0033 0%, #000000 100%);
          padding: 24px;
        }

        .auth-glass-card {
          width: 100%; 
          max-width: 440px; 
          background: rgba(31, 31, 46, 0.65);
          backdrop-filter: blur(24px); 
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08); 
          border-radius: 32px;
          padding: 48px 40px; 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: authAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-header { 
          text-align: center; 
          margin-bottom: 32px; 
        }

        .auth-form { 
          display: flex; 
          flex-direction: column; 
          gap: 24px; 
        }

        .input-group { 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
        }

        .input-group label { 
          font-size: 0.8rem; 
          font-weight: 600; 
          color: rgba(255,255,255,0.5); 
          margin-left: 4px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }

        /* Password Container */
        .password-container {
          position: relative;
          width: 100%;
        }

        .password-container input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          font-size: 1.25rem;
          padding: 5px;
          z-index: 2;
        }

        .password-toggle:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .modern-input {
          background: rgba(255,255,255,0.04); 
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; 
          padding: 16px; 
          color: white; 
          transition: all 0.3s ease;
          outline: none; 
          font-size: 1rem;
          width: 100%;
        }

        .modern-input:focus {
          border-color: ${cyanAccent}; 
          background: rgba(0, 153, 255, 0.08);
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
        }

        .btn-mega {
          background: ${cyanAccent}; 
          color: #000; 
          padding: 18px; 
          border-radius: 14px;
          font-weight: 800; 
          border: none; 
          cursor: pointer; 
          transition: all 0.3s ease;
          font-size: 1.05rem; 
          margin-top: 8px;
        }

        .btn-mega:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 12px 30px rgba(0, 255, 157, 0.35); 
        }

        .status-msg { 
          font-size: 0.85rem; 
          text-align: center; 
          margin-top: 12px; 
          border-radius: 8px; 
          padding: 10px; 
        }
        .status-msg.error { 
          background: rgba(255, 77, 77, 0.1); 
          color: #ff4d4d; 
          border: 1px solid rgba(255, 77, 77, 0.2); 
        }
        .status-msg.info { 
          color: ${cyanAccent}; 
        }

        .auth-footer { 
          margin-top: 32px; 
          text-align: center; 
          font-size: 0.95rem; 
          color: rgba(255,255,255,0.4); 
        }

        @keyframes authAppear { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}} />
    </main>
  );
}