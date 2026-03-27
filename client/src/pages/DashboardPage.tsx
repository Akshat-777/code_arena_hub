import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import DifficultyChart from "../components/DifficultyChart";

type PlatformStats = {
  total: number;
  easy?: number;
  medium?: number;
  hard?: number;
  rating?: number | string;
  rank?: number | string;
  stars?: string;
  calendar?: string;
};

type Stats = {
  leetcode: PlatformStats;
  codeforces: PlatformStats;
  codechef: PlatformStats;
};

type User = { _id: string; name: string; email: string; };

const PLATFORMS = [
  { id: "leetcode",   name: "LeetCode",   color: "#ffa116", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/leetcode.svg" },
  { id: "codeforces", name: "Codeforces", color: "#1f8acb", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codeforces.svg" },
  { id: "codechef",   name: "CodeChef",   color: "#b45309", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codechef.svg" },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("leetcode");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          api.get("/user/me"),
          api.get("/user/me/stats")
        ]);
        setUser(userRes.data);
        setStats(statsRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
        if (err?.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("code_arena_token");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  if (loading) return (
    <div className="ca-page ca-flex-center">
      <div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>⚔️</div>
      <p className="ca-muted">Synchronizing your performance...</p>
    </div>
  );
  if (error) return <div className="ca-page ca-flex-center"><p className="ca-error">{error}</p></div>;

  const currentStats = stats ? (stats as any)[selectedPlatform] : null;
  const platformInfo = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <div className="ca-page animate-fade-in" style={{ paddingBottom: "60px" }}>
      {/* Hero Header */}
      <div className="ca-hero animate-slide-up" style={{ marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <h1 className="ca-title" style={{ fontSize: 30, marginBottom: 4 }}>
            Developer Dashboard
          </h1>
          {user && (
            <p className="ca-subtitle">
              Welcome back,{" "}
              <span style={{ color: "var(--accent-light)", fontWeight: 700 }}>{user.name}</span>
              {" "}👋
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button className="ca-btn-outline" onClick={() => navigate("/profile")}>
            ✏️ Profile
          </button>
          <button
            className="ca-btn-outline"
            onClick={handleLogout}
            style={{ borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Platform Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {PLATFORMS.map(p => {
          const isActive = selectedPlatform === p.id;
          const pStats = stats ? (stats as any)[p.id] : null;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              style={{
                padding: "20px 16px",
                borderRadius: 20,
                border: `1px solid ${isActive ? p.color : "rgba(255,255,255,0.06)"}`,
                background: isActive
                  ? `linear-gradient(145deg, ${p.color}15 0%, rgba(18,18,22,0.9) 100%)`
                  : "rgba(18,18,22,0.7)",
                backdropFilter: "blur(20px)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isActive ? `0 0 0 1px ${p.color}40, 0 8px 32px ${p.color}20` : "0 4px 12px rgba(0,0,0,0.3)",
                transform: isActive ? "translateY(-3px)" : "translateY(0)",
              }}
            >
              <img
                src={p.icon}
                alt={p.name}
                style={{
                  width: 36,
                  height: 36,
                  filter: isActive ? "brightness(0) invert(1)" : "brightness(0) invert(1) opacity(0.35)",
                  transition: "filter 0.3s",
                }}
              />
              <span style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, color: isActive ? p.color : "var(--text)", transition: "color 0.3s" }}>
                {p.name}
              </span>
              {pStats && (
                <span style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 800, color: isActive ? "var(--text-h)" : "var(--text)", transition: "color 0.3s" }}>
                  {pStats.total || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Stats Panel */}
      {currentStats && platformInfo && (
        <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>

            {/* Primary Stats Card */}
            <div
              className="ca-card"
              style={{
                padding: "32px",
                borderLeft: `4px solid ${platformInfo.color}`,
                background: `linear-gradient(145deg, ${platformInfo.color}08 0%, rgba(18,18,22,0.85) 100%)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text)", marginBottom: 6 }}>
                    Total Solved
                  </p>
                  <p style={{ fontFamily: "var(--heading)", fontSize: 56, fontWeight: 800, color: "var(--text-h)", lineHeight: 1, letterSpacing: -2 }}>
                    {currentStats.total || 0}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text)", marginBottom: 6 }}>
                    Rating
                  </p>
                  <p style={{ fontFamily: "var(--heading)", fontSize: 36, fontWeight: 800, color: platformInfo.color, lineHeight: 1 }}>
                    {currentStats.rating || "N/A"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text)", marginBottom: 4 }}>Global Rank</p>
                  <p style={{ fontWeight: 700, color: "var(--text-h)", fontSize: 16 }}>{currentStats.rank || "—"}</p>
                </div>
                {currentStats.stars && (
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text)", marginBottom: 4 }}>Stars</p>
                    <p style={{ fontWeight: 700, color: "#fbbf24", fontSize: 16 }}>{currentStats.stars}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Breakdown */}
            {(currentStats.easy !== undefined || selectedPlatform === "leetcode") && (
              <DifficultyChart
                easy={currentStats.easy || 0}
                medium={currentStats.medium || 0}
                hard={currentStats.hard || 0}
                total={currentStats.total || 0}
              />
            )}
          </div>

          {/* Footer note */}
          <div
            className="ca-card"
            style={{
              padding: "16px 24px",
              textAlign: "center",
              background: `linear-gradient(90deg, ${platformInfo.color}05 0%, transparent 50%, ${platformInfo.color}05 100%)`,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <img src={platformInfo.icon} alt="" style={{ width: 16, height: 16, filter: "brightness(0) invert(1) opacity(0.5)" }} />
            <p style={{ color: "var(--text)", fontSize: 13 }}>
              Data fetched live from <strong style={{ color: "var(--text-h)" }}>{platformInfo.name}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;