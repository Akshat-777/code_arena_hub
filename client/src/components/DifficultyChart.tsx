import React from "react";

interface DifficultyChartProps {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

const DifficultyChart: React.FC<DifficultyChartProps> = ({ easy, medium, hard, total }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  const getOffset = (count: number) => circumference - (count / (total || 1)) * circumference;

  return (
    <div className="ca-card" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "24px" }}>
      <div style={{ position: "relative", width: "100px", height: "100px" }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
          
          {/* Hard - Red */}
          <circle 
            cx="50" cy="50" r={radius} fill="transparent" stroke="#ef4444" strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={getOffset(hard)}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} 
          />
          {/* Medium - Yellow */}
          <circle 
            cx="50" cy="50" r={radius} fill="transparent" stroke="#facc15" strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={getOffset(medium + hard)}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} 
          />
          {/* Easy - Green */}
          <circle 
            cx="50" cy="50" r={radius} fill="transparent" stroke="#22c55e" strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={getOffset(easy + medium + hard)}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} 
          />
        </svg>
        <div style={{ 
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-h)" }}>{total}</div>
          <div style={{ fontSize: "10px", color: "var(--text)", textTransform: "uppercase" }}>Solved</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="ca-muted" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#22c55e" }} /> Easy
          </span>
          <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{easy}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="ca-muted" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#facc15" }} /> Medium
          </span>
          <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{medium}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="ca-muted" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ef4444" }} /> Hard
          </span>
          <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{hard}</span>
        </div>
      </div>
    </div>
  );
};

export default DifficultyChart;
