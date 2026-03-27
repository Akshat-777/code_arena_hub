import express from "express";
import authMiddleware from "../middleware/auth.js";
import Challenge from "../models/Challenge.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    let host = req.query.host;
    if (host) host = String(host).toLowerCase();

    const query = {};
    if (host) Object.assign(query, { host: { $in: host.split(",") } });

    let challenges = await Challenge.find(query).select("-__v").sort({ createdAt: -1 });

    // Auto-seed if db is completely empty
    if (challenges.length === 0 && !host) {
      try {
        const cfRes = await fetch("https://codeforces.com/api/problemset.problems");
        const cfData = await cfRes.json();
        if (cfData.status === "OK") {
          const problems = cfData.result.problems.slice(0, 50);
          const toInsert = problems.map(p => ({
            host: "codeforces",
            name: p.name,
            vanity: `${p.contestId}${p.index}`,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            difficulty: p.rating ? p.rating.toString() : "medium",
            tags: p.tags ? p.tags.slice(0, 3) : []
          }));
          await Challenge.insertMany(toInsert);
          challenges = await Challenge.find(query).select("-__v").sort({ createdAt: -1 });
        }
      } catch (err) {
        console.error("Auto route seed error", err);
      }
    }

    res.json({ total: challenges.length, results: challenges });
  } catch (err) {
    console.error("Error fetching challenges", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

