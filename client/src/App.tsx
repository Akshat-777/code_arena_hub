import { Route, Routes, Link, Navigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ContestsPage from "./pages/ContestsPage";
import HackathonsPage from "./pages/HackathonsPage";
import PotdPage from "./pages/PotdPage";
import ProfilePage from "./pages/ProfilePage";
import RankingsPage from "./pages/RankingsPage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("code_arena_token"));
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("code_arena_token"));
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("code_arena_token");
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login"; // Force reload to clear all states
  };

  return (
    <div className="ca-app">
      <header className="ca-topbar">
        <div className="ca-topbarInner">
          <Link to="/" className="ca-brand">
            <img src="/logo.png" alt="Code Arena Logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover" }} />
            Code Arena
          </Link>
          <nav className="ca-nav">
            <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/contests">
              Contests
            </NavLink>
            <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/hackathons">
              Hackathons
            </NavLink>
            <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/potd">
              POTD
            </NavLink>
            <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/rankings">
              Rankings
            </NavLink>
            {isLoggedIn ? (
              <>
                <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/profile">
                  Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="ca-navLink"
                  style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "4px 12px", marginLeft: 8 }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink
                className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"}
                to="/login"
                style={({ isActive }) => isActive ? {} : {
                  background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                  color: "#09090b",
                  fontWeight: 700,
                  border: "none",
                }}
              >
                Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="ca-main">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/hackathons" element={<HackathonsPage />} />
          <Route path="/potd" element={<PotdPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        padding: "16px 20px",
        textAlign: "center",
        color: "var(--text)",
        fontSize: 12,
        opacity: 0.5,
      }}>
        © {new Date().getFullYear()} Code Arena — All rights reserved
      </footer>
    </div>
  );
};

export default App;
