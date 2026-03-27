import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("profile name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ profile: user.profile, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/me/profile", authMiddleware, async (req, res) => {
  try {
    const allowed = [
      "bio",
      "location",
      "website",
      "github",
      "linkedin",
      "leetcode",
      "codeforces",
      "codechef",
      "skills",
    ];
    const incoming = req.body || {};
    const patch = {};

    const extractUsername = (val) => {
      if (!val || typeof val !== 'string') return val;
      if (!val.includes("/")) return val;
      try {
        const urlStr = val.startsWith('http') ? val : 'https://' + val;
        const url = new URL(urlStr);
        const parts = url.pathname.split("/").filter(Boolean);
        for (let i = 0; i < parts.length; i++) {
           if (['u','users','user','profile','practice'].includes(parts[i].toLowerCase()) && i + 1 < parts.length) {
              return parts[i+1];
           }
        }
        return parts[parts.length - 1] || val;
      } catch (e) {
        return val;
      }
    };

    for (const key of allowed) {
      if (incoming[key] !== undefined) {
        let val = incoming[key];
        if (["leetcode", "codeforces", "codechef"].includes(key)) {
          val = extractUsername(val);
        }
        patch[`profile.${key}`] = val;
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: patch },
      { new: true }
    ).select("profile name email");

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ profile: updated.profile, name: updated.name, email: updated.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me/stats", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("profile");
    if (!user) return res.status(404).json({ message: "User not found" });

    const stats = { 
      leetcode: { total: 0, easy: 0, medium: 0, hard: 0, rating: 0, rank: 0, calendar: "{}" }, 
      codeforces: { total: 0, rating: 0, rank: "unrated" },
      codechef: { total: 0, rating: 0, stars: "0*" }
    };
    
    // Leetcode Fetch
    if (user.profile?.leetcode) {
      try {
        const lcRes = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query($username: String!) { 
              matchedUser(username: $username) { 
                submitStatsGlobal { acSubmissionNum { difficulty count } } 
                submissionCalendar
              } 
              userContestRanking(username: $username) {
                rating
                globalRanking
              }
            }`,
            variables: { username: user.profile.leetcode }
          }),
        });
        const lcData = await lcRes.json();
        const userData = lcData?.data?.matchedUser;
        const contestData = lcData?.data?.userContestRanking;
        
        if (userData) {
          userData.submitStatsGlobal?.acSubmissionNum?.forEach(s => {
            if (s.difficulty === "All") stats.leetcode.total = s.count;
            if (s.difficulty === "Easy") stats.leetcode.easy = s.count;
            if (s.difficulty === "Medium") stats.leetcode.medium = s.count;
            if (s.difficulty === "Hard") stats.leetcode.hard = s.count;
          });
          stats.leetcode.calendar = userData.submissionCalendar || "{}";
        }
        if (contestData) {
          stats.leetcode.rating = Math.round(contestData.rating) || 0;
          stats.leetcode.rank = contestData.globalRanking || 0;
        }
      } catch (err) { console.error("LC stats error", err); }
    }

    // Codeforces Fetch
    if (user.profile?.codeforces) {
      try {
        const cfStatusRes = await fetch(`https://codeforces.com/api/user.status?handle=${user.profile.codeforces}`);
        const cfStatusData = await cfStatusRes.json();
        if (cfStatusData.status === "OK") {
           const solved = new Set();
           cfStatusData.result.forEach(r => {
             if (r.verdict === "OK" && r.problem?.name) solved.add(r.problem.name);
           });
           stats.codeforces.total = solved.size;
        }
        const cfInfoRes = await fetch(`https://codeforces.com/api/user.info?handles=${user.profile.codeforces}`);
        const cfInfoData = await cfInfoRes.json();
        if (cfInfoData.status === "OK" && cfInfoData.result.length > 0) {
          const info = cfInfoData.result[0];
          stats.codeforces.rating = info.rating || 0;
          stats.codeforces.rank = info.rank || "unrated";
        }
      } catch (err) { console.error("CF stats error", err); }
    }

    // CodeChef Fetch
    if (user.profile?.codechef) {
      try {
        const ccRes = await fetch(`https://www.codechef.com/users/${user.profile.codechef}`, { 
          headers: { "User-Agent": "Mozilla/5.0" } 
        });
        const ccHtml = await ccRes.text();
        const ratingMatch = ccHtml.match(/<div class="rating-number">(\d+)<\/div>/);
        if (ratingMatch) stats.codechef.rating = parseInt(ratingMatch[1]);
        const starsMatch = ccHtml.match(/(\d\*)<\/span>/);
        if (starsMatch) stats.codechef.stars = starsMatch[1];
        const solvedMatch = ccHtml.match(/Total Problems Solved: (\d+)/);
        if (solvedMatch) stats.codechef.total = parseInt(solvedMatch[1]);
        else {
           const solvedCountMatch = ccHtml.match(/Fully Solved \((\d+)\)/);
           if (solvedCountMatch) stats.codechef.total = parseInt(solvedCountMatch[1]);
        }
      } catch (err) { console.error("CC stats error", err); }
    }


    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;