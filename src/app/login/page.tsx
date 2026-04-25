"use client";

import { useState } from "react";
import Link from "next/link";
// 1. Import Firebase utilities
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
      } catch {
        data = {};
      }

      if (!res.ok) return setMsg(data.error || "Login failed. Please try again.");
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

        {/* 3. Added Google Login Button
        <button 
          onClick={onGoogleLogin} 
          className="btn-google" 
          type="button"
        >
          <img src="data:image/png;base64,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" alt="G" width="50" height="30" />
          Continue with Google
        </button> */}

        <div className="divider">
          <span>TIkTokShop</span>
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
            <input 
              className="modern-input" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button className="btn-mega" type="submit">
            Login to Dashboard
          </button>
          
          {msg && <p className={`status-msg ${msg.includes('failed') || msg.includes('error') ? 'error' : 'info'}`}>{msg}</p>}
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link href="/signup" style={{ color: cyanAccent, fontWeight: "600", textDecoration: "none" }}>Sign Up</Link></p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at top right, rgba(0, 255, 157, 0.12), transparent), linear-gradient(180deg, #1a0033 0%, #000000 100%);
          padding: 24px;
        }
        .auth-glass-card {
          width: 100%; max-width: 440px; background: rgba(31, 31, 46, 0.65);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px;
          padding: 48px 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: authAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-header { text-align: center; margin-bottom: 24px; }
        
        /* New Styles for Google Button & Divider */
        .btn-google {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px;
          background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);
          padding: 14px; border-radius: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
          margin-bottom: 12px;
        }
        .btn-google:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        
        .divider {
          display: flex; align-items: center; text-align: center; margin: 20px 0;
          color: rgba(255,255,255,0.2); font-size: 0.8rem; text-transform: uppercase;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .divider:not(:empty)::before { margin-right: .5em; }
        .divider:not(:empty)::after { margin-left: .5em; }

        .auth-form { display: flex; flex-direction: column; gap: 24px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.5); margin-left: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .modern-input {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 16px; color: white; transition: all 0.3s ease;
          outline: none; font-size: 1rem;
        }
        .modern-input:focus {
          border-color: ${cyanAccent}; background: rgba(0, 153, 255, 0.08);
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
        }
        .btn-mega {
          background: ${cyanAccent}; color: #000; padding: 18px; border-radius: 14px;
          font-weight: 800; border: none; cursor: pointer; transition: all 0.3s ease;
          font-size: 1.05rem; margin-top: 8px;
        }
        .btn-mega:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0, 255, 157, 0.35); filter: brightness(1.1); }
        .status-msg { font-size: 0.85rem; text-align: center; margin-top: 12px; border-radius: 8px; padding: 8px; }
        .status-msg.error { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); }
        .status-msg.info { color: ${cyanAccent}; }
        .auth-footer { margin-top: 32px; text-align: center; font-size: 0.95rem; color: rgba(255,255,255,0.4); }
        @keyframes authAppear { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </main>
  );
}
