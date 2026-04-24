"use client";

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <main className="container">
      <div className="card" style={{ marginTop: 24 }}>
        <h2>Error</h2>
        <p>{error.message}</p>
      </div>
    </main>
  );
}
