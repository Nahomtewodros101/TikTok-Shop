import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export async function Navbar() {
  const session = await getSession();
  const cyanAccent = "#00ff9d";

  return (
    <nav className="nav-shell" style={{
      position: "fixed",
      top: 0,
      width: "100%",
      zIndex: 100,
      background: "rgba(10, 8, 24, 0.75)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0, 153, 255, 0.25)",
      height: "70px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="nav-inner" style={{
        width: "100%",
        maxWidth: "1400px",
        padding: "0 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* BRAND LOGO */}
        <div>
          <Link href="/" style={{
            textDecoration: "none",
            color: "#fff",
            fontSize: "1.4rem",
            fontWeight: "900",
            letterSpacing: "-1px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ color: cyanAccent }}>TikTok</span>Shop
          </Link>
        </div>

        {/* NAV LINKS */}
        <div className="nav-links" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/" className="nav-link">Home</Link>
          
          {!session && (
            <>
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/signup" style={{
                background: cyanAccent,
                color: "#000",
                padding: "8px 20px",
                borderRadius: "8px",
                fontWeight: "bold",
                textDecoration: "none",
                fontSize: "0.9rem",
                transition: "transform 0.2s ease"
              }} className="hover-lift">
                Get Started
              </Link>
            </>
          )}

          {session && (
            <>
              <div className="nav-separator" style={{ height: "20px", width: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span className="nav-user" style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>
                {session.name}
              </span>
             
              <Link href="/profile" className="nav-link">Profile</Link>
              <LogoutButton />
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }
        .nav-link:hover { color: ${cyanAccent}; }
        .hover-lift:hover { transform: translateY(-2px); }
        @media (max-width: 900px) {
          .nav-shell { height: auto !important; }
          .nav-inner {
            padding: 12px 16px !important;
            flex-wrap: wrap;
            gap: 10px;
          }
          .nav-links {
            width: 100%;
            justify-content: flex-start;
            gap: 14px !important;
            flex-wrap: wrap;
          }
        }
        @media (max-width: 560px) {
          .nav-user,
          .nav-separator {
            display: none !important;
          }
          .nav-link {
            font-size: 0.88rem;
          }
        }
      `}} />
    </nav>
  );
}