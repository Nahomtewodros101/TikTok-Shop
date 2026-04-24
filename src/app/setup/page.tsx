import { SetupClient } from "./setupClient";

export default function SetupPage() {
  return (
    <main className="container" style={{ marginTop: 24 }}>
      <div className="card">
        <h2>Initial Setup</h2>
        <p>Use this page once to generate invite key, create first admin, and seed tasks.</p>
      </div>
      <div style={{ marginTop: 16 }}>
        <SetupClient />
      </div>
    </main>
  );
}
