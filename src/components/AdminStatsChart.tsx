"use client";

export function AdminStatsChart({ users, txCount, totalAmount }: { users: number; txCount: number; totalAmount: number }) {
  // We simulate "trend" points to create that trading graph look
  const data = [
    { label: "Start", val: 0 },
    { label: "Users", val: users },
    { label: "TXs", val: txCount },
    { label: "Volume", val: totalAmount },
  ];

  const maxValue = Math.max(users, txCount, totalAmount, 1);
  const chartHeight = 150;
  const chartWidth = 400;

  // Generate points for the "Polyline" trading path
  const points = data
    .map((d, i) => {
      const x = (i * (chartWidth / (data.length - 1)));
      const y = chartHeight - (d.val / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-[#0b0e11] p-6 rounded-xl border border-gray-800 shadow-2xl font-mono text-[#00ff9d]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs uppercase tracking-widest text-gray-400">Market Overview / Admin Stats</h3>
        <span className="text-[10px] bg-[#00ff9d22] px-2 py-1 rounded border border-[#00ff9d44]">LIVE DATA</span>
      </div>

      <div className="relative">
        <svg width="100%" height="200" viewBox={`0 -20 ${chartWidth} 200`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00ff9d" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line key={p} x1="0" y1={p * chartHeight} x2={chartWidth} y2={p * chartHeight} stroke="#1e2329" strokeWidth="1" />
          ))}

          {/* Area Fill */}
          <polyline
            points={`${points} ${chartWidth},${chartHeight} 0,${chartHeight}`}
            fill="url(#lineGradient)"
          />

          {/* Main Trading Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#00ff9d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes */}
          {data.map((d, i) => {
             const x = (i * (chartWidth / (data.length - 1)));
             const y = chartHeight - (d.val / maxValue) * chartHeight;
             return (
               <g key={i}>
                 <circle cx={x} cy={y} r="4" fill="#0b0e11" stroke="#00ff9d" strokeWidth="2" />
                 <text x={x} y={y - 12} textAnchor="middle" fill="#ffffff" fontSize="10" className="font-bold">
                   {d.val.toLocaleString()}
                 </text>
                 <text x={x} y={chartHeight + 20} textAnchor="middle" fill="#474d57" fontSize="9">
                   {d.label}
                 </text>
               </g>
             );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-gray-800">
        <div>
          <p className="text-[10px] text-gray-500 uppercase">Users</p>
          <p className="text-lg text-white font-bold">{users.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase">Orders</p>
          <p className="text-lg text-[#0099ff] font-bold">{txCount}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase">Total Vol</p>
          <p className="text-lg text-[#ff6600] font-bold">${totalAmount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
