import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Challenge = {
  host: string;
  name: string;
  vanity: string;
  url: string;
  difficulty?: string;
  tags?: string[];
};

type ApiList<T> = { total: number; results: T[] };

const HOSTS = ["LeetCode", "CodeForces", "CodeChef"] as const;

const HOST_COLORS: Record<string, string> = {
  LeetCode:      "#ffa116",
  CodeForces:    "#1f8acb",
  CodeChef:      "#b45309",
};

const DIFF_COLORS: Record<string, string> = {
  easy:   "#22c55e",
  medium: "#f59e0b",
  hard:   "#ef4444",
};

const ChallengesPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Challenge[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const hostParam = selectedHosts.join(",");
        const url = hostParam ? `/challenges?host=${hostParam}` : "/challenges";
        const res = await api.get<ApiList<Challenge>>(url);
        setItems(res.data.results);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load challenges");
        if (err?.response?.status === 401) navigate("/login");
      }
    };
    run();
  }, [navigate, selectedHosts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.host.toLowerCase().includes(q) ||
        c.vanity.toLowerCase().includes(q)
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
            <span style={{ fontSize: "0.7em" }}>⚡</span> Challenges
          </h1>
          <p className="ca-subtitle">Short tasks, quick wins. Build your skill one problem at a time.</p>
        </div>
        <div className="ca-stats">
          <div className="ca-stat">
            <div className="ca-statLabel">Showing</div>
            <div className="ca-statValue">{filtered.length}</div>
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
              placeholder="Search challenges…"
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
            <h2>No challenges found</h2>
            <p>Add data to the <code>challenges</code> collection in MongoDB to show it here.</p>
          </div>
        )}

        <div className="ca-grid">
          {filtered.map((c, i) => {
            const color = HOST_COLORS[c.host] || "var(--accent)";
            const diff = (c.difficulty || "").toLowerCase();
            const diffColor = DIFF_COLORS[diff] || "var(--text)";
            return (
              <article
                key={c.vanity}
                className="ca-card animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s`, borderTop: `3px solid ${color}` }}
              >
                <div className="ca-cardTop">
                  <span className="ca-badge" style={{ borderColor: `${color}50`, background: `${color}15`, color: color }}>
                    {c.host}
                  </span>
                  {c.difficulty && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: diffColor, background: `${diffColor}15`, padding: "3px 10px", borderRadius: 999 }}>
                      {c.difficulty}
                    </span>
                  )}
                </div>
                <h2 className="ca-cardTitle">{c.name}</h2>
                <div className="ca-cardMeta">
                  <span className="ca-mono">{c.vanity}</span>
                  {c.tags?.length ? (
                    <>
                      <span className="ca-sep">•</span>
                      <span className="ca-muted">{c.tags.slice(0, 3).join(", ")}</span>
                    </>
                  ) : null}
                </div>
                <div className="ca-cardActions">
                  <a className="ca-link" href={c.url} target="_blank" rel="noreferrer"
                     style={{ background: color, borderColor: color, boxShadow: `0 4px 15px ${color}40` }}>
                    Open challenge ↗
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

export default ChallengesPage;
