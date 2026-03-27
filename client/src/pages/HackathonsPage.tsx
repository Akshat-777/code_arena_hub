import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Hackathon = {
  host: string;
  name: string;
  vanity: string;
  url: string;
  registerationStartTimeUnix: number;
  registerationEndTimeUnix: number;
  hackathonStartTimeUnix: number;
  duration: number;
};

type ApiList<T> = { total: number; results: T[] };

const HOSTS = ["devfolio", "devpost", "unstop"] as const;

const HOST_COLORS: Record<string, string> = {
  devfolio: "#3b82f6",
  devpost:  "#003e54",
  unstop:   "#7c3aed",
};

function daysLeft(unix: number) {
  const diff = unix * 1000 - Date.now();
  if (diff <= 0) return "Closed";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d left`;
  return `${h}h left`;
}

const HackathonsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Hackathon[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const hostParam = selectedHosts.join(",");
        const url = hostParam ? `/hackathons?host=${hostParam}` : "/hackathons";
        const res = await api.get<ApiList<Hackathon>>(url);
        setItems(res.data.results);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load hackathons");
        if (err?.response?.status === 401) navigate("/login");
      }
    };
    run();
  }, [navigate, selectedHosts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.host.toLowerCase().includes(q) ||
        h.vanity.toLowerCase().includes(q)
    );
  }, [items, query]);

  const toggleHost = (host: string) => {
    setSelectedHosts((prev) =>
      prev.includes(host) ? prev.filter((x) => x !== host) : [...prev, host]
    );
  };

  return (
    <div className="ca-page animate-fade-in">
      <div className="ca-hero animate-slide-up">
        <div>
          <h1 className="ca-title" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "0.7em" }}>💡</span> Hackathons
          </h1>
          <p className="ca-subtitle">Explore hackathons and secure your spot before registration closes.</p>
        </div>
        <div className="ca-stats">
          <div className="ca-stat">
            <div className="ca-statLabel">Showing</div>
            <div className="ca-statValue">{filtered.length}</div>
          </div>
          <div className="ca-stat">
            <div className="ca-statLabel">Platforms</div>
            <div className="ca-statValue" style={{ color: "var(--accent-light)" }}>
              {selectedHosts.length || "All"}
            </div>
          </div>
        </div>
      </div>

      <div className="ca-panel">
        <div className="ca-controls">
          <div className="ca-search">
            <svg className="ca-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="ca-input"
              placeholder="Search hackathons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="ca-chips">
            {HOSTS.map((host) => {
              const active = selectedHosts.includes(host);
              const color = HOST_COLORS[host] || "var(--accent)";
              return (
                <button
                  key={host}
                  className={active ? "ca-chip ca-chipActive" : "ca-chip"}
                  onClick={() => toggleHost(host)}
                  type="button"
                  style={active ? { borderColor: `${color}60`, boxShadow: `0 0 8px ${color}30` } : {}}
                >
                  <span className="ca-dot" style={{ background: color }} aria-hidden="true" />
                  {host}
                </button>
              );
            })}
            {selectedHosts.length > 0 && (
              <button className="ca-chip ca-chipGhost" type="button" onClick={() => setSelectedHosts([])}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {error && <p className="ca-error">{error}</p>}
        {filtered.length === 0 && !error && (
          <div className="ca-empty">
            <h2>No hackathons found</h2>
            <p>If your MongoDB collections are empty, you'll see this.</p>
          </div>
        )}

        <div className="ca-grid">
          {filtered.map((h, i) => {
            const regEnd = new Date(h.registerationEndTimeUnix * 1000);
            const start = new Date(h.hackathonStartTimeUnix * 1000);
            const hours = Math.max(1, Math.round(h.duration / 60));
            const color = HOST_COLORS[h.host] || "var(--accent)";
            const regLeft = daysLeft(h.registerationEndTimeUnix);
            const isUrgent = h.registerationEndTimeUnix * 1000 - Date.now() < 86400000 * 2;
            return (
              <article
                key={h.vanity}
                className="ca-card animate-slide-up"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  borderTop: `3px solid ${color}`,
                }}
              >
                <div className="ca-cardTop">
                  <span className="ca-badge" style={{ borderColor: `${color}50`, background: `${color}15`, color: color }}>
                    {h.host}
                  </span>
                  <span
                    className="ca-muted"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: isUrgent ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                      color: isUrgent ? "#f87171" : "var(--text-h)",
                    }}
                  >
                    Reg: {regLeft}
                  </span>
                </div>
                <h2 className="ca-cardTitle">{h.name}</h2>
                <div className="ca-cardMeta" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <span className="ca-muted">Starts: {start.toLocaleDateString()}</span>
                  <span className="ca-muted">Reg ends: {regEnd.toLocaleDateString()} • {hours}h</span>
                </div>
                <div className="ca-cardActions">
                  <a className="ca-link" href={h.url} target="_blank" rel="noreferrer"
                     style={{ background: color, borderColor: color, boxShadow: `0 4px 15px ${color}40` }}>
                    Open hackathon ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HackathonsPage;
