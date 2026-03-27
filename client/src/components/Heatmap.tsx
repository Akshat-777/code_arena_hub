import React, { useMemo } from "react";

interface HeatmapProps {
  calendar: string; // JSON string from LeetCode
}

const Heatmap: React.FC<HeatmapProps> = ({ calendar }) => {
  const data = useMemo(() => {
    try {
      return JSON.parse(calendar || "{}");
    } catch (e) {
      return {};
    }
  }, [calendar]);

  const days = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const ts = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000);
      result.push({
        date: d,
        count: data[ts] || 0,
      });
    }
    return result;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return "rgba(255, 255, 255, 0.05)";
    if (count < 3) return "rgba(168, 85, 247, 0.3)";
    if (count < 6) return "rgba(168, 85, 247, 0.6)";
    return "rgba(168, 85, 247, 0.9)";
  };

  return (
    <div className="ca-card" style={{ gridColumn: "1 / -1", padding: "24px" }}>
      <h3 className="ca-cardTitle" style={{ marginBottom: "16px" }}>Activity Heatmap</h3>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(53, 1fr)", 
        gridAutoFlow: "column",
        gridTemplateRows: "repeat(7, 1fr)",
        gap: "4px",
        overflowX: "auto",
        paddingBottom: "8px"
      }}>
        {days.map((day, i) => (
          <div
            key={i}
            title={`${day.date.toDateString()}: ${day.count} submissions`}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              backgroundColor: getColor(day.count),
            }}
          />
        ))}
      </div>
      <div className="ca-muted" style={{ marginTop: "12px", fontSize: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
        <span>Less</span>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255, 255, 255, 0.05)" }} />
        <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(168, 85, 247, 0.3)" }} />
        <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(168, 85, 247, 0.6)" }} />
        <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(168, 85, 247, 0.9)" }} />
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;
