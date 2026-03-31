import { useEffect, useState } from "react";
import { api } from "../lib/api";

type UserRanking = {
  _id: string;
  name: string;
  globalScore: number;
  profile: { github: string };
  cachedStats: {
    leetcode: { rating: number; solved: number };
    codeforces: { rating: number; solved: number };
    codechef: { rating: number; solved: number };
  };
};

const RankingsPage = () => {
  const [users, setUsers] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await api.get<UserRanking[]>("/user/rankings");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch rankings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="ca-page ca-flex-center">
        <div className="ca-loader"></div>
        <p style={{ marginTop: 12, color: "var(--text)", fontSize: 14 }}>Loading the elite...</p>
      </div>
    );
  }

  return (
    <div className="ca-page animate-fade-in">
      <div className="ca-hero">
        <div>
          <h1 className="ca-title">Global Rankings</h1>
          <p className="ca-subtitle">The hall of fame. Normalized scoring across LeetCode, Codeforces, and CodeChef.</p>
        </div>
        <div className="ca-stats" style={{ gap: 8 }}>
            <div className="ca-stat" style={{ padding: "8px 12px", minWidth: 90 }}>
                <div className="ca-statLabel" style={{ fontSize: 9 }}>Formula</div>
                <div className="ca-statValue" style={{ fontSize: 14 }}>Weighted</div>
            </div>
        </div>
      </div>

      <div className="ca-panel" style={{ marginTop: 24 }}>
        {users.length === 0 ? (
          <div className="ca-empty">
            <h2>No Rankings Yet</h2>
            <p>Visit your dashboard to calculate your initial score and join the leaderboard!</p>
          </div>
        ) : (
          <table className="ca-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Rank</th>
                <th>Competitor</th>
                <th style={{ textAlign: "right" }}>Platform Ratings</th>
                <th style={{ textAlign: "right", width: 160 }}>Arena Score</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td>
                    <span className={`ca-rank-badge ${i < 3 ? `rank-${i + 1}` : ""}`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="ca-avatar-sm">{user.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-h)", fontSize: 15 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text)", opacity: 0.7 }}>
                          {user.profile.github ? `@${user.profile.github}` : "Arena Member"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", fontSize: 13 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text)", opacity: 0.6 }}>LC</span>
                        <span style={{ color: "var(--text-h)", fontWeight: 600 }}>{user.cachedStats.leetcode.rating}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text)", opacity: 0.6 }}>CF</span>
                        <span style={{ color: "var(--text-h)", fontWeight: 600 }}>{user.cachedStats.codeforces.rating}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text)", opacity: 0.6 }}>CC</span>
                        <span style={{ color: "var(--text-h)", fontWeight: 600 }}>{user.cachedStats.codechef.rating}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ 
                            fontFamily: "var(--mono)", 
                            fontWeight: 800, 
                            fontSize: 22,
                            background: i < 3 
                                ? "linear-gradient(135deg, var(--accent-light), #fff)" 
                                : "var(--text-h)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: i < 3 ? "transparent" : "var(--text-h)"
                        }}>
                            {user.globalScore.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--accent-light)", opacity: 0.8, letterSpacing: 0.5 }}>POINTS</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 32, padding: 20, borderRadius: 16, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
         <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-h)", marginBottom: 12 }}>How is this calculated?</h3>
         <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
            Our <strong>Arena Score</strong> normalizes performance across platforms to ensure a fair comparison:
            <br />
            <code style={{ background: "transparent", padding: 0 }}>Score = (LeetCode × 1.0) + (Codeforces × 1.2) + (CodeChef × 0.9) + (Total Solved × 0.5)</code>
            <br />
            <span style={{ opacity: 0.7 }}>Note: To appear on the leaderboard, simply visit your dashboard to trigger a fresh stats sync!</span>
         </p>
      </div>
    </div>
  );
};

export default RankingsPage;
