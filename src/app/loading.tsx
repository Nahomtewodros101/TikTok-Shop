export default function LoadingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #1a0033 0%, #000000 100%)",
        padding: 20
      }}
    >
      <div className="card dashboard-panel" style={{ width: "min(460px, 100%)", textAlign: "center", padding: 28 }}>
        <div
          style={{
            width: 42,
            height: 42,
            margin: "0 auto 12px auto",
            borderRadius: "999px",
            border: "3px solid rgba(0,153,255,0.25)",
            borderTopColor: "#00ff9d",
            animation: "spinLoader 0.9s linear infinite"
          }}
        />
        <h2 style={{ margin: 0 }}>Preparing your dashboard...</h2>
        <p className="dashboard-subtle" style={{ marginTop: 8 }}>Secure data is loading.</p>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spinLoader { to { transform: rotate(360deg); } }` }} />
    </main>
  );
}
