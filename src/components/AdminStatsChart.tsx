"use client";

export function AdminStatsChart({ users, txCount, totalAmount }: { users: number; txCount: number; totalAmount: number }) {
  const values = [
    { label: "Users", value: users, color: "#00FF9D" },
    { label: "Transactions", value: txCount, color: "#0099FF" },
    { label: "Total Amount", value: Math.round(totalAmount), color: "#FF6600" }
  ];
  const max = Math.max(...values.map((v) => Math.max(v.value, 1)));
  return (
    <div>
      <h3>Statistics Graph</h3>
      <svg width="100%" height="220" viewBox="0 0 420 220" role="img" aria-label="Admin statistics chart">
        {values.map((v, i) => {
          const h = (v.value / max) * 140;
          const x = 40 + i * 120;
          const y = 180 - h;
          return (
            <g key={v.label}>
              <rect x={x} y={y} width={60} height={h} fill={v.color} rx={8} />
              <text x={x + 30} y={200} textAnchor="middle" fill="#d5deea" fontSize="12">
                {v.label}
              </text>
              <text x={x + 30} y={y - 8} textAnchor="middle" fill="#ffffff" fontSize="12">
                {v.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
