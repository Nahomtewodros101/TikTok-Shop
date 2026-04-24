import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="footer-container">
        <span className="footer-copy">TTS &copy; {new Date().getFullYear()}</span>
        <div className="footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .footer-wrap { width: 100%; background: linear-gradient(180deg, #100022 0%, #000000 100%); border-top: 1px solid rgba(0,153,255,0.25); padding: 40px 24px; }
        .footer-container { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
        .footer-copy { color: rgba(255,255,255,0.45); font-size: 0.8rem; }
        .footer-links { display: flex; gap: 20px; }
        .footer-links a { color: rgba(0,255,157,0.9); text-decoration: none; font-size: 0.8rem; }

        @media (max-width: 600px) {
          .footer-container { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}} />
    </footer>
  );
}