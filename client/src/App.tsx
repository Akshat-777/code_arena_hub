import { Route, Routes, Link, Navigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ContestsPage from "./pages/ContestsPage";
import HackathonsPage from "./pages/HackathonsPage";
import PotdPage from "./pages/PotdPage";
import ChallengesPage from "./pages/ChallengesPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("code_arena_token"));
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("code_arena_token"));
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

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
            <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/challenges">
              Challenges
            </NavLink>
            {isLoggedIn ? (
              <>
                <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className={({ isActive }) => isActive ? "ca-navLink ca-navLinkActive" : "ca-navLink"} to="/profile">
                  Profile
                </NavLink>
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
          <Route path="/challenges" element={<ChallengesPage />} />
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
