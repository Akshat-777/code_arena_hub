import express from "express";
import authMiddleware from "../middleware/auth.js";
import { UpcomingContest, AllContest } from "../models/Contest.js";
import Metadata from "../models/Metadata.js";

const router = express.Router();

const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function refreshContests() {
  console.log("Refreshing contests from external APIs...");
  const newContests = [];

  // 1. Codeforces
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const cfRes = await fetch("https://codeforces.com/api/contest.list?gym=false", { signal: controller.signal });
    clearTimeout(timeout);
    const cfData = await cfRes.json();
    if (cfData.status === "OK") {
      cfData.result.forEach(c => {
        if (c.phase === "BEFORE" || c.phase === "CODING") {
          newContests.push({
            host: "codeforces",
            name: c.name,
            vanity: `cf-${c.id}`,
            url: `https://codeforces.com/contest/${c.id}`,
            startTimeUnix: c.startTimeSeconds,
            duration: Math.round(c.durationSeconds / 60)
          });
        }
      });
    }
  } catch (err) { console.error("CF Refresh Error:", err.message); }

  // 2. CodeChef
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const ccRes = await fetch("https://www.codechef.com/api/list/contests/all?mode=all", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const ccData = await ccRes.json();
    if (ccData.status === "success") {
      ccData.future_contests.forEach(c => {
        newContests.push({
          host: "codechef",
          name: c.contest_name,
          vanity: c.contest_code.toLowerCase(),
          url: `https://www.codechef.com/${c.contest_code}`,
          startTimeUnix: Math.floor(new Date(c.contest_start_date_iso).getTime() / 1000),
          duration: parseInt(c.contest_duration)
        });
      });
    }
  } catch (err) { console.error("CC Refresh Error:", err.message); }

  // 3. LeetCode
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const lcRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { allContests { title titleSlug startTime duration } }`
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const lcData = await lcRes.json();
    const lcContests = lcData?.data?.allContests || [];
    lcContests.forEach(c => {
      if (c.startTime * 1000 > Date.now() - 3600000) { // Future or ongoing
        newContests.push({
          host: "leetcode",
          name: c.title,
          vanity: c.titleSlug,
          url: `https://leetcode.com/contest/${c.titleSlug}`,
          startTimeUnix: c.startTime,
          duration: Math.round(c.duration / 60)
        });
      }
    });
  } catch (err) { console.error("LC Refresh Error:", err.message); }

  if (newContests.length > 0) {
    // Clear old upcoming contests and insert new ones
    // We use a simple clear & insert for "Upcoming", but for "All" we might want to upsert
    await UpcomingContest.deleteMany({});
    await UpcomingContest.insertMany(newContests);
    
    // Also add to AllContest (avoiding duplicates by URL)
    for (const c of newContests) {
      await AllContest.updateOne({ url: c.url }, { $set: c }, { upsert: true });
    }
  }

  await Metadata.updateOne(
    { key: "global_meta" },
    { $set: { lastRefreshContests: new Date() } },
    { upsert: true }
  );
  console.log(`Successfully refreshed ${newContests.length} contests.`);
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const meta = await Metadata.findOne({ key: "global_meta" });
    const lastRefresh = meta?.lastRefreshContests;
    const now = new Date();

    if (!lastRefresh || (now - lastRefresh) > REFRESH_INTERVAL) {
      // Trigger background refresh but don't block the request if we have existing data
      refreshContests().catch(err => console.error("Background Refresh Failed", err));
      
      // If DB is empty, we might want to wait for the first refresh
      const currentCount = await UpcomingContest.countDocuments();
      if (currentCount === 0) {
        await refreshContests();
      }
    }

    let host = req.query.host;
    let vanity = req.query.vanity;

    if (host) {
      host = String(host).toLowerCase();
    }
    if (vanity) {
      vanity = String(vanity).toLowerCase();
    }

    if (vanity) {
      const contestByVanity = await AllContest.findOne({ vanity }).select(
        "-__v"
      );

      if (contestByVanity) {
        return res.status(200).json({
          total: 1,
          results: [contestByVanity],
        });
      }

      return res.status(200).json({
        total: 0,
        results: [],
      });
    }

    const query = {};
    if (host) {
      const platformArray = host.split(",");
      Object.assign(query, { host: { $in: platformArray } });
    }

    const contests = await UpcomingContest.find(query)
      .select("-__v")
      .sort({ startTimeUnix: 1 });

    return res.status(200).json({
      total: contests.length,
      results: contests,
    });
  } catch (err) {
    console.error("Error fetching contests", err);
    return res.status(500).json({
      error: "Internal server error",
      message: "Internal server error",
    });
  }
});

export default router;

