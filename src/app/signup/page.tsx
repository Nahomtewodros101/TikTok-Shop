"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const cyanAccent = "#00ff9d";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    withdrawalPassword: "",
    confirmWithdrawalPassword: "",
    invitationKey: ""
  });

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"idle" | "error" | "info">("idle");

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
    withdrawalPassword: false,
    confirmWithdrawalPassword: false,
  });

  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsgType("info");
    setMsg("Creating account...");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      setMsgType("error");
      return setMsg(data.error || "Signup failed");
    }

    setMsgType("info");
    setMsg("Account created successfully! Redirecting...");
    router.push("/dashboard");
  }

  // Helper to determine input type
  const getInputType = (key: string) => {
    if (key.toLowerCase().includes("password")) {
      const fieldKey = key as keyof typeof showPasswords;
      return showPasswords[fieldKey] ? "text" : "password";
    }
    return "text";
  };

  return (
    <main className="auth-page">
      <div className="auth-glass-card signup-wide">
        <div className="auth-header">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "8px", color: "#fff" }}>
            Join <span style={{ color: cyanAccent }}>TIkTokShop</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
            Create your account and start earning crypto securely
          </p>
        </div>

        <form onSubmit={onSubmit} className="signup-grid">
          {Object.entries(form).map(([key, value]) => {
            const isPasswordField = key.toLowerCase().includes("password");
            
            return (
              <div key={key} className="input-group">
                <label>{formatLabel(key)}</label>
                
                {isPasswordField ? (
                  <div className="password-container">
                    <input
                      className="modern-input"
                      type={getInputType(key)}
                      placeholder={formatLabel(key)}
                      value={value}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePassword(key as keyof typeof showPasswords)}
                    >
                      {showPasswords[key as keyof typeof showPasswords] ? "🙈" : "👁️"}
                    </button>
                  </div>
                ) : (
                  <input
                    className="modern-input"
                    type="text"
                    placeholder={formatLabel(key)}
                    value={value}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    required
                  />
                )}
              </div>
            );
          })}

          <div className="signup-full-width">
            <button className="btn-mega" type="submit" style={{ width: "100%", marginTop: "20px" }}>
              Register Account
            </button>
            {msg && (
              <p className={`status-msg ${msgType === "error" ? "error" : "info"}`}>
                {msg}
              </p>
            )}
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already a member?{" "}
            <Link href="/login" style={{ color: cyanAccent, fontWeight: "600", textDecoration: "none" }}>
              Log In
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
          background: linear-gradient(180deg, #1a0033 0%, #000000 100%);
          background-image: radial-gradient(circle at 0% 0%, rgba(0, 255, 157, 0.1) 0%, transparent 50%);
          padding: 60px 24px;
        }
        .auth-glass-card {
          background: rgba(31, 31, 46, 0.65); 
          backdrop-filter: blur(24px); 
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08); 
          border-radius: 32px; 
          padding: 48px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: authAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .signup-wide { width: 100%; max-width: 850px; }
        .auth-header { text-align: center; margin-bottom: 30px; }
        
        .signup-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
        }
        .signup-full-width { grid-column: span 2; }
        .input-group { 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }
        .input-group label { 
          font-size: 0.7rem; 
          font-weight: 700; 
          color: rgba(255,255,255,0.4); 
          text-transform: uppercase; 
          margin-left: 4px; 
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
          background: rgba(255,255,255,0.03); 
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; 
          padding: 14px; 
          color: white; 
          outline: none; 
          transition: all 0.3s ease;
          width: 100%;
        }
        .modern-input:focus { 
          border-color: ${cyanAccent}; 
          background: rgba(0, 153, 255, 0.08); 
        }

        .btn-mega {
          background: ${cyanAccent}; 
          color: #000; 
          padding: 18px; 
          border-radius: 14px;
          font-weight: 900; 
          border: none; 
          cursor: pointer; 
          transition: all 0.3s ease;
        }
        .btn-mega:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 255, 157, 0.3);
        }

        .status-msg { 
          font-size: 0.9rem; 
          text-align: center; 
          margin-top: 15px; 
          padding: 10px; 
          border-radius: 10px; 
        }
        .status-msg.error { 
          background: rgba(255, 77, 77, 0.08); 
          color: #ff4d4d; 
          border: 1px solid rgba(255, 77, 77, 0.2); 
        }
        .status-msg.info { 
          color: ${cyanAccent}; 
        }

        .auth-footer { 
          margin-top: 36px; 
          text-align: center; 
          color: rgba(255,255,255,0.4); 
        }

        @media (max-width: 768px) {
          .signup-grid { grid-template-columns: 1fr; }
          .signup-full-width { grid-column: span 1; }
        }

        @keyframes authAppear { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}} />
    </main>
  );
}