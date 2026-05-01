import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Typewriter } from "@/components/Typewriter";
import { HeroMotion } from "@/components/HeroMotion";
import { AnimatedHeroSvg } from "@/components/AnimatedHeroSvg";
import * as motion from "framer-motion/client";

export default async function HomePage() {
  const session = await getSession();
  const cyanAccent = "#00ff9d";
  
  const message =
    session?.role === "admin"
      ? `Welcome Admin ${session.name}. System secure.`
      : session
        ? `Welcome ${session.name}. Continue earning.`
        : "Sign in to start your secure crypto task journey.";

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1a0033 0%, #000000 100%)", color: "#FFFFFF", overflow: "hidden" }}>
      <HeroMotion>
        <section className="hero-layout" style={{ display: "flex", width: "100%", minHeight: "100vh",  }}>
          
          {/* --- LEFT SIDE: THE MASSIVE IMAGE SIDE (Fixed 30%) --- */}
          <div className="hero-left" style={{ 
            flex: "0 0 30%", 
            position: "relative", 
            background: "#11051d", 
            borderRight: "1px solid rgba(0, 153, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden" // Essential to crop the oversized SVG
          }}>
            
            {/* The Illustration - Scaled to fill and overflow */}
            <div style={{ 
              width: "180%", // Pushes it way past the 30% container edges
              height: "100%", 
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.8,
              filter: `drop-shadow(0 0 40px rgba(0, 255, 157, 0.2))`
            }}>
              <AnimatedHeroSvg />
            </div>

            {/* Depth Gradients */}
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              background: "linear-gradient(90deg, rgba(26,0,51,0) 65%, #1a0033 100%)",
              zIndex: 2 
            }} />
            
            {/* The "Alive" Scanner Line */}
            <div className="alive-scanner" />
          </div>

          {/* --- RIGHT SIDE: THE CONTENT SIDE (70%) --- */}
          <div className="hero-right" style={{ 
            flex: "1 1 70%", 
            padding: "0 clamp(40px, 10vw, 120px)",
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            position: "relative",
            background: "radial-gradient(circle at 0% 50%, rgba(0, 153, 255, 0.08) 0%, transparent 50%)"
          }}>
            
            <div className="hero-content-wrap" style={{ maxWidth: "800px" }}>
              <motion.h1 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ 
                  fontSize: "clamp(3rem, 7vw, 5.5rem)", 
                  fontWeight: 900, 
                  lineHeight: "0.9", 
                  letterSpacing: "-0.06em",
                  marginBottom: "24px" 
                }}
              >
                  <br/>
                <span style={{ color: cyanAccent, textShadow: `0 0 30px rgba(0, 255, 157, 0.35)` }}>TikTok</span>Shop
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ marginBottom: "48px" }}
              >
              
                <div style={{ fontSize: "1.1rem", color: "rgba(250, 252, 249, )", letterSpacing: "0.02em"  }}>
                  <Typewriter text={message} />
                </div>
              </motion.div>

              <motion.div
                className="hero-cta"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{ display: "flex", gap: "24px" }}
              >
                {!session ? (
                  <>
                    <Link href="/signup" className="btn-mega">Create Account</Link>
                    <Link href="/login" className="btn-outline">Login</Link>
                  </>
                ) : (
                  <Link href={session.role === "admin" ? "/admin" : "/dashboard"} className="btn-mega">
                    Open Dashboard
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </HeroMotion>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-mega {
          background-color: ${cyanAccent}; 
          color: #000; 
          padding: 20px 48px; 
          border-radius: 14px; 
          font-weight: 800; 
          text-decoration: none; 
          font-size: 1.1rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 40px rgba(0, 255, 157, 0.25);
        }
        .btn-mega:hover { 
          transform: translateY(-5px) scale(1.02); 
          box-shadow: 0 15px 50px rgba(0, 255, 157, 0.45); 
        }

        .btn-outline {
          color: #fff; 
          border: 1px solid rgba(255,255,255,0.1); 
          padding: 20px 48px; 
          border-radius: 14px; 
          font-weight: 600; 
          text-decoration: none;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.03);
        }
        .btn-outline:hover { 
          background: rgba(255,255,255,0.08); 
          border-color: rgba(255,255,255,0.3);
        }

        .alive-scanner {
          position: absolute; top: 0; left: 0; width: 100%; height: 4px;
          background: linear-gradient(90deg, transparent, ${cyanAccent}, transparent);
          opacity: 0.2; z-index: 5; animation: scanner 8s linear infinite;
        }
        @keyframes scanner { 0% { top: -10%; } 100% { top: 110%; } }
        @media (max-width: 980px) {
          .hero-layout {
            position: relative;
            min-height: 100vh;
            overflow: hidden;
          }
          .hero-left {
            position: absolute !important;
            inset: 0;
            min-height: 100%;
            width: 100%;
            border-right: 0 !important;
            border-bottom: 0 !important;
            opacity: 0.5;
            z-index: 1;
            pointer-events: none;
          }
          .hero-right {
            flex: 1 1 auto !important;
            min-height: 100vh;
          
            z-index: 3;
            background: linear-gradient(
              180deg,
              rgba(26, 0, 51, 0.72) 0%,
              rgba(12, 0, 22, 0.62) 45%,
              rgba(0, 0, 0, 0.8) 100%
            ) !important;
          }
          .hero-content-wrap {
            position: relative;
            z-index: 4;
          }
        }
        @media (max-width: 640px) {
          .hero-left {
            opacity: 0.5;
          }
          .hero-cta {
            flex-direction: column;
            gap: 12px !important;
            align-items: stretch;
          }
          .btn-mega,
          .btn-outline {
            display: block;
            width: 100%;
            text-align: center;
            padding: 14px 20px;
            font-size: 1rem;
          }
        }
      `}} />
    </main>
  );
}