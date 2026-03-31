import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Contest = {
  host: string;
  name: string;
  vanity: string;
  url: string;
  startTimeUnix: number;
  duration: number;
};

type ContestsResponse = {
  total: number;
  results: Contest[];
};

const HOSTS = ["leetcode", "codechef", "codeforces"] as const;

const HOST_COLORS: Record<string, string> = {
  leetcode:      "#ffa116",
  codechef:      "#b45309",
  codeforces:    "#1f8acb",
};

function timeUntil(unix: number) {
  const diff = unix * 1000 - Date.now();
  if (diff <= 0) return "Starting soon";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return `in ${Math.floor(h / 24)}d`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

const ContestsPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [error, setError] = useState("");
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const hostParam = selectedHosts.join(",");
        const url = hostParam ? `/contests?host=${hostParam}` : "/contests";
        const res = await api.get<ContestsResponse>(url);
        setContests(res.data.results);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load contests");
        if (err?.response?.status === 401) navigate("/login");
      }
    };
    fetchContests();
  }, [navigate, selectedHosts]);

  const toggleHost = (host: string) => {
    setSelectedHosts((prev) =>
      prev.includes(host) ? prev.filter((h) => h !== host) : [...prev, host]
    );
  };

  const filtered = contests.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.host.toLowerCase().includes(q) ||
      c.vanity.toLowerCase().includes(q)
    );
  });

  return (
    <div className="ca-page animate-fade-in">
      <div className="ca-hero animate-slide-up">
        <div>
          <h1 className="ca-title" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "0.7em" }}>🏆</span> Contests
          </h1>
          <p className="ca-subtitle">Track upcoming contests across platforms. Filter, search, and jump in.</p>
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
              placeholder="Search by name, platform, or vanity…"
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
            <h2>No contests found</h2>
            <p>Try clearing filters or changing your search.</p>
          </div>
        )}

        <div className="ca-grid">
          {filtered.map((c, i) => {
            const start = new Date(c.startTimeUnix * 1000);
            const hours = Math.max(1, Math.round(c.duration / 60));
            const color = HOST_COLORS[c.host] || "var(--accent)";
            return (
              <article
                key={c.vanity}
                className="ca-card animate-slide-up"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  borderTop: `3px solid ${color}`,
                }}
              >
                <div className="ca-cardTop">
                  <span className="ca-badge" style={{ borderColor: `${color}50`, background: `${color}15`, color: color }}>
                    {c.host}
                  </span>
                  <span
                    className="ca-muted"
                    style={{
                      fontSize: 11,
                      background: "rgba(255,255,255,0.05)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontWeight: 600,
                      color: "var(--text-h)"
                    }}
                  >
                    {timeUntil(c.startTimeUnix)}
                  </span>
                </div>
                <h2 className="ca-cardTitle">{c.name}</h2>
                <div className="ca-cardMeta">
                  <span className="ca-muted">{start.toLocaleString()}</span>
                  <span className="ca-sep">•</span>
                  <span className="ca-muted">{hours}h</span>
                </div>
                <div className="ca-cardActions">
                  <a
                    className="ca-link"
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: color, borderColor: color, boxShadow: `0 4px 15px ${color}40` }}
                  >
                    Open contest ↗
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

export default ContestsPage;
