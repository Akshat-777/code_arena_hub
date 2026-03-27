import express from "express";
import authMiddleware from "../middleware/auth.js";
import { Potd } from "../models/Potd.js";

const router = express.Router();

// Get latest POTDs for all platforms
router.get("/", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Check DB first for today's POTDs
    const latestPotds = await Potd.find({ date: today }).select("-__v");
    const existingPlatforms = latestPotds.map(p => p.platform);
    let results = [...latestPotds];
    let toSave = [];

    // 1. LeetCode
    if (!existingPlatforms.includes("LeetCode")) {
      try {
        const lcRes = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query questionOfToday { activeDailyCodingChallengeQuestion { date link question { title titleSlug } } }`
          }),
        });
        const lcData = await lcRes.json();
        const challenge = lcData?.data?.activeDailyCodingChallengeQuestion;
        if (challenge) {
          toSave.push({
            date: today,
            problemName: challenge.question.title,
            problemUrl: `https://leetcode.com${challenge.link}`,
            platform: "LeetCode"
          });
        }
      } catch (err) { console.error("LC Potd", err); }
    }


    // 3. CodeChef
    if (!existingPlatforms.includes("CodeChef")) {
      try {
        const ccRes = await fetch("https://www.codechef.com/api/list/problems?page=1&limit=50", { headers: { "User-Agent": "Mozilla/5.0" } });
        const ccData = await ccRes.json();
        if (ccData?.data && ccData.data.length > 0) {
          const index = dayOfYear % ccData.data.length;
          const p = ccData.data[index];
          toSave.push({
            date: today,
            problemName: p.name || p.code,
            problemUrl: `https://www.codechef.com/problems/${p.code}`,
            platform: "CodeChef"
          });
        }
      } catch (err) { console.error("CC Potd", err); }
    }

    // 4. Codeforces
    if (!existingPlatforms.includes("CodeForces")) {
      try {
        const cfRes = await fetch("https://codeforces.com/api/problemset.problems", { headers: { "User-Agent": "Mozilla/5.0" } });
        const cfData = await cfRes.json();
        if (cfData?.result?.problems && cfData.result.problems.length > 0) {
          const pList = cfData.result.problems;
          const index = dayOfYear % pList.length;
          const p = pList[index];
          toSave.push({
            date: today,
            problemName: p.name,
            problemUrl: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            platform: "CodeForces"
          });
        }
      } catch (err) { console.error("CF Potd", err); }
    }

    if (toSave.length > 0) {
      const inserted = await Potd.insertMany(toSave);
      results = [...results, ...inserted];
    }

    // Return the combined list. If empty, fall back to older DB entries.
    if (results.length > 0) {
      return res.json(results);
    }

    const fallbacks = await Potd.find().sort({ createdAt: -1 }).limit(4);
    if (fallbacks.length > 0) {
      return res.json(fallbacks);
    }

    return res.status(200).json({ message: "No POTDs available" });
  } catch (err) {
    console.error("Error fetching potds", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

