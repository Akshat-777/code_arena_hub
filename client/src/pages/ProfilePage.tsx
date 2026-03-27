import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Profile = {
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  leetcode: string;
  codeforces: string;
  codechef: string;
  skills: string[];
};

const PLATFORM_FIELDS: Array<{ key: keyof Profile; label: string; icon: string; color: string }> = [
  { key: "leetcode",   label: "LeetCode handle",   icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/leetcode.svg",   color: "#ffa116" },
  { key: "codeforces", label: "Codeforces handle", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codeforces.svg", color: "#1f8acb" },
  { key: "codechef",   label: "CodeChef handle",   icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/codechef.svg",   color: "#b45309" },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userName, setUserName] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const [profileRes, userRes] = await Promise.all([
          api.get("/user/me/profile"),
          api.get("/user/me"),
        ]);
        setProfile(profileRes.data.profile);
        setUserName(userRes.data.name || "");
        setSkillsText((profileRes.data.profile?.skills || []).join(", "));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load profile");
        if (err?.response?.status === 401) navigate("/login");
      }
    };
    run();
  }, [navigate]);

  const update = (key: keyof Profile, value: any) => {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await api.put("/user/me/profile", { ...profile, skills });
      setProfile(res.data.profile);
      setSkillsText((res.data.profile?.skills || []).join(", "));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = userName
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="ca-page animate-fade-in">
      {/* Hero */}
      <div className="ca-hero animate-slide-up" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div className="ca-avatar-ring">
            {initials || "👤"}
          </div>
          <div>
            <h1 className="ca-title" style={{ fontSize: 28, marginBottom: 4 }}>
              {userName || "Your Profile"}
            </h1>
            <p className="ca-subtitle">Build your developer identity in Code Arena.</p>
          </div>
        </div>
      </div>

      <div className="ca-panel">
        {error && <p className="ca-error">{error}</p>}
        {!profile && !error && (
          <div className="ca-flex-center">
            <p className="ca-muted animate-pulse">Loading profile…</p>
          </div>
        )}

        {profile && (
          <form className="ca-form" onSubmit={onSave} style={{ maxWidth: 1000 }}>
            {/* Personal Section */}
            <div className="ca-formGrid">
              <div className="ca-form-section-label">Personal</div>

              <label className="ca-field ca-fieldWide">
                <span className="ca-fieldLabel">Bio</span>
                <textarea
                  className="ca-textarea"
                  value={profile.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </label>

              <label className="ca-field">
                <span className="ca-fieldLabel">📍 Location</span>
                <input className="ca-input ca-input-plain" value={profile.location} onChange={(e) => update("location", e.target.value)} placeholder="City, Country" />
              </label>

              <label className="ca-field">
                <span className="ca-fieldLabel">🌐 Website</span>
                <input className="ca-input ca-input-plain" value={profile.website} onChange={(e) => update("website", e.target.value)} placeholder="https://yoursite.com" />
              </label>

              {/* Social Section */}
              <div className="ca-form-section-label">Social</div>

              <label className="ca-field">
                <span className="ca-fieldLabel">GitHub</span>
                <div className="ca-input-wrap">
                  <span className="ca-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                  </span>
                  <input className="ca-input" value={profile.github} onChange={(e) => update("github", e.target.value)} placeholder="github-username" />
                </div>
              </label>

              <label className="ca-field">
                <span className="ca-fieldLabel">LinkedIn</span>
                <div className="ca-input-wrap">
                  <span className="ca-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </span>
                  <input className="ca-input" value={profile.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin-username" />
                </div>
              </label>

              {/* Competitive Section */}
              <div className="ca-form-section-label">Competitive Profiles</div>

              {PLATFORM_FIELDS.map(({ key, label, icon, color }) => (
                <label key={key} className="ca-field">
                  <span className="ca-fieldLabel" style={{ color: color }}>{label}</span>
                  <div className="ca-input-wrap">
                    <span className="ca-input-icon">
                      <img src={icon} alt={label} style={{ width: 16, height: 16, filter: `brightness(0) saturate(100%) invert(1)`, opacity: 0.6 }} />
                    </span>
                    <input
                      className="ca-input"
                      value={(profile as any)[key] || ""}
                      onChange={(e) => update(key, e.target.value)}
                      placeholder={`your-handle`}
                      style={{ borderColor: "var(--border)" }}
                      onFocus={e => { e.currentTarget.style.borderColor = `${color}80`; e.currentTarget.style.boxShadow = `0 0 0 3px ${color}15`; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </label>
              ))}

              {/* Skills */}
              <div className="ca-form-section-label">Skills</div>

              <label className="ca-field ca-fieldWide">
                <span className="ca-fieldLabel">Skills (comma-separated)</span>
                <input
                  className="ca-input ca-input-plain"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, TypeScript, Python, DSA..."
                />
              </label>
            </div>

            <div className="ca-formActions" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button className="ca-btn" type="submit" disabled={saving} style={{ minWidth: 160 }}>
                {saving ? "Saving…" : "Save Profile"}
              </button>
              {saved && (
                <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 600 }}>
                  ✓ Saved successfully!
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
