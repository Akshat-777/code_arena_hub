import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("code_arena_token", res.data.token);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ca-auth-wrap animate-fade-in">
      {/* Decorative orbs */}
      <div className="ca-orb ca-orb-1" />
      <div className="ca-orb ca-orb-2" />

      <div className="ca-auth-card animate-slide-up">
        <div className="ca-auth-icon">⚔️</div>
        <h1 className="ca-auth-title">Welcome Back</h1>
        <p className="ca-auth-subtitle">Log in to access your dashboard and stats.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="ca-field" style={{ textAlign: "left" }}>
            <span className="ca-fieldLabel">Email Address</span>
            <div className="ca-input-wrap">
              <span className="ca-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <input type="email" className="ca-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
          </label>

          <label className="ca-field" style={{ textAlign: "left" }}>
            <span className="ca-fieldLabel">Password</span>
            <div className="ca-input-wrap">
              <span className="ca-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input type="password" className="ca-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
          </label>

          {error && <p className="ca-error" style={{ margin: 0 }}>{error}</p>}

          <button type="submit" className="ca-btn" style={{ width: "100%", padding: "14px", marginTop: 4, fontSize: 15 }} disabled={loading}>
            {loading ? "Signing in…" : "Login to Code Arena"}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center" }} className="ca-muted">
          Need an account?{" "}
          <Link to="/register" style={{ color: "var(--accent-light)", fontWeight: 600, textDecoration: "none" }}>
            Register here →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;