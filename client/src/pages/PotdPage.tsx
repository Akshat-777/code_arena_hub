import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Potd = {
  date: string;
  problemName: string;
  problemUrl: string;
  platform: string;
};

const PLATFORMS: Record<string, { color: string; icon: string; emoji: string }> = {
  "LeetCode":      { color: "#ffa116", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/leetcode.svg",      emoji: "🟡" },
  "CodeForces":    { color: "#1f8acb", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codeforces.svg",    emoji: "🔵" },
  "CodeChef":      { color: "#b45309", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codechef.svg",      emoji: "🟤" },
};

const PotdPage = () => {
  const navigate = useNavigate();
  const [potds, setPotds] = useState<Potd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPotds = async () => {
      try {
        const res = await api.get("/potd");
        if (Array.isArray(res.data)) {
          setPotds(res.data);
        } else if (res.data?.problemUrl) {
          setPotds([res.data]);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load Daily Challenges");
        if (err?.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchPotds();
  }, [navigate]);

  return (
    <div className="ca-page animate-fade-in" style={{ paddingBottom: "60px" }}>
      <div className="ca-hero animate-slide-up" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="ca-title" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "0.75em" }}>🔥</span> Daily Challenges
          </h1>
          <p className="ca-subtitle" style={{ maxWidth: 560 }}>
            One problem a day, every single day. Master your skills across all major platforms.
          </p>
        </div>
        <div className="ca-stats">
          <div className="ca-stat">
            <div className="ca-statLabel">Today's</div>
            <div className="ca-statValue" style={{ color: "var(--accent-light)" }}>{potds.length}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ca-flex-center">
          <div style={{ fontSize: 32, animation: "pulse 1.5s infinite" }}>🔥</div>
          <p className="ca-muted">Syncing today's challenges...</p>
        </div>
      ) : error ? (
        <div className="ca-flex-center"><p className="ca-error">{error}</p></div>
      ) : potds.length === 0 ? (
        <div className="ca-empty">
          <h2>No challenges today</h2>
          <p>Try refreshing in a few moments or check back later.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {potds.map((potd, index) => {
            const pInfo = PLATFORMS[potd.platform] || { color: "var(--accent)", icon: "", emoji: "⚡" };
            return (
              <article
                key={index}
                className="ca-card animate-slide-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  borderTop: `4px solid ${pInfo.color}`,
                  padding: "28px",
                  background: `linear-gradient(145deg, ${pInfo.color}08 0%, rgba(18,18,22,0.8) 60%)`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {pInfo.icon && (
                      <img
                        src={pInfo.icon}
                        alt={potd.platform}
                        style={{ width: 22, height: 22, filter: "brightness(0) invert(1)" }}
                      />
                    )}
                    <span style={{ fontWeight: 700, fontSize: 13, color: pInfo.color, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {potd.platform}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text)", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 6 }}>
                    {potd.date}
                  </span>
                </div>

                <h2 style={{ fontFamily: "var(--heading)", fontSize: 19, fontWeight: 700, color: "var(--text-h)", lineHeight: 1.35, marginBottom: 24, minHeight: 52 }}>
                  {potd.problemName}
                </h2>

                <div style={{ paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a
                    className="ca-link"
                    href={potd.problemUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      background: pInfo.color,
                      borderColor: pInfo.color,
                      color: "#fff",
                      boxShadow: `0 4px 20px ${pInfo.color}50`,
                    }}
                  >
                    Solve Challenge ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && potds.length > 0 && (
        <div
          className="animate-slide-up"
          style={{
            marginTop: 56,
            textAlign: "center",
            padding: "40px 32px",
            background: "linear-gradient(145deg, rgba(168,85,247,0.06) 0%, rgba(18,18,22,0.4) 100%)",
            borderRadius: 24,
            border: "1px solid var(--accent-border)",
            boxShadow: "0 0 40px rgba(168,85,247,0.06)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
          <h3 style={{ fontFamily: "var(--heading)", fontSize: 22, color: "var(--text-h)", marginBottom: 8 }}>
            Consistency is Key
          </h3>
          <p className="ca-muted" style={{ maxWidth: 460, margin: "0 auto" }}>
            Solving one problem a day adds up to <strong style={{ color: "var(--accent-light)" }}>365+ problems</strong> a year. Keep pushing!
          </p>
        </div>
      )}
    </div>
  );
};

export default PotdPage;
