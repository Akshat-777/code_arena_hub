import express from "express";
import authMiddleware from "../middleware/auth.js";
import { UpcomingHackathon, AllHackathon } from "../models/Hackathon.js";
import Metadata from "../models/Metadata.js";

const router = express.Router();

const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

async function fetchDevfolio() {
  try {
    const res = await fetch("https://api.devfolio.co/api/search/hackathons", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "https://devfolio.co" },
      body: JSON.stringify({ type: "application_open", from: 0, size: 50 })
    });
    const data = await res.json();
    return (data.hits?.hits || []).map(h => {
      const s = h._source;
      const start = new Date(s.starts_at).getTime();
      const end = new Date(s.ends_at).getTime();
      const regEnd = s.hackathon_setting?.reg_ends_at ? new Date(s.hackathon_setting.reg_ends_at).getTime() : start;
      return {
        host: "devfolio",
        name: s.name,
        vanity: s.slug,
        url: `https://${s.slug}.devfolio.co/`,
        registerationStartTimeUnix: Math.floor(new Date(s.hackathon_setting?.reg_starts_at || s.starts_at).getTime() / 1000),
        registerationEndTimeUnix: Math.floor(regEnd / 1000),
        hackathonStartTimeUnix: Math.floor(start / 1000),
        duration: Math.round((end - start) / 60000)
      };
    });
  } catch (e) { console.error("Devfolio fetch error:", e.message); return []; }
}

async function fetchDevpost() {
  try {
    const res = await fetch("https://devpost.com/api/hackathons", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = await res.json();
    return (data.hackathons || []).map(h => {
      let regEnd = Date.now() + 86400000 * 7; // Default 7 days
      try {
        if (h.submission_period_dates) {
          const parts = h.submission_period_dates.split("-");
          const endPart = parts[parts.length - 1].trim();
          const parsed = new Date(endPart);
          if (!isNaN(parsed.getTime())) regEnd = parsed.getTime();
        }
      } catch (e) { /* fallback to default */ }

      return {
        host: "devpost",
        name: h.title,
        vanity: h.url.split("/").pop(),
        url: h.url,
        registerationStartTimeUnix: Math.floor(Date.now() / 1000),
        registerationEndTimeUnix: Math.floor(regEnd / 1000),
        hackathonStartTimeUnix: Math.floor(Date.now() / 1000),
        duration: 2880
      };
    });
  } catch (e) { console.error("Devpost fetch error:", e.message); return []; }
}

async function fetchUnstop() {
  try {
    const res = await fetch("https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&oppstatus=open", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = await res.json();
    return (data.data?.data || []).map(h => {
      const regEnd = h.regnRequirements?.end_regn_dt ? new Date(h.regnRequirements.end_regn_dt).getTime() : Date.now();
      const start = h.start_dt ? new Date(h.start_dt).getTime() : Date.now();
      const end = h.end_dt ? new Date(h.end_dt).getTime() : start + 86400000;
      return {
        host: "unstop",
        name: h.title,
        vanity: h.public_url.split("/").pop(),
        url: `https://unstop.com/${h.public_url}`,
        registerationStartTimeUnix: Math.floor(new Date(h.regnRequirements?.start_regn_dt || Date.now()).getTime() / 1000),
        registerationEndTimeUnix: Math.floor(regEnd / 1000),
        hackathonStartTimeUnix: Math.floor(start / 1000),
        duration: Math.round((end - start) / 60000)
      };
    });
  } catch (e) { console.error("Unstop fetch error:", e.message); return []; }
}

export async function refreshHackathons() {
  console.log("Refreshing hackathons from multiple platforms...");
  
  const results = await Promise.allSettled([
    fetchDevfolio(),
    fetchDevpost(),
    fetchUnstop()
  ]);

  let allHacks = [];
  results.forEach(res => {
    if (res.status === "fulfilled") {
      // Improve vanity extraction and ensure required fields
      const processed = res.value.map(h => {
        if (!h.vanity) {
          const parts = h.url.split("/").filter(p => !!p);
          h.vanity = parts[parts.length - 1] || "hackathon";
        }
        return h;
      }).filter(h => h.name && h.url && h.vanity);
      
      allHacks = allHacks.concat(processed);
    }
  });

  const now = Math.floor(Date.now() / 1000);
  const filteredHacks = allHacks.filter(h => h.registerationEndTimeUnix > now);

  console.log(`Fetched ${allHacks.length} hackathons. ${filteredHacks.length} passed time filter.`);

  // Always clear and update
  await UpcomingHackathon.deleteMany({});
  if (filteredHacks.length > 0) {
    try {
      await UpcomingHackathon.insertMany(filteredHacks);
      for (const h of filteredHacks) {
        await AllHackathon.updateOne({ url: h.url }, { $set: h }, { upsert: true });
      }
    } catch (err) {
      console.error("DB Update Error during refresh:", err.message);
    }
  }

  await Metadata.updateOne(
    { key: "global_meta" },
    { $set: { lastRefreshHackathons: new Date() } },
    { upsert: true }
  );
  console.log(`Successfully refreshed ${filteredHacks.length} hackathons.`);
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const meta = await Metadata.findOne({ key: "global_meta" });
    const lastRefresh = meta?.lastRefreshHackathons;
    const now = new Date();

    if (!lastRefresh || (now - lastRefresh) > REFRESH_INTERVAL) {
      refreshHackathons().catch(err => console.error("Background Refresh Failed", err));
      
      const currentCount = await UpcomingHackathon.countDocuments();
      if (currentCount === 0) {
        await refreshHackathons();
      }
    }

    let host = req.query.host;
    let vanity = req.query.vanity;

    if (host) host = String(host).toLowerCase();
    if (vanity) vanity = String(vanity).toLowerCase();

    if (vanity) {
      const hack = await AllHackathon.findOne({ vanity }).select("-__v");
      return res.status(200).json({
        total: hack ? 1 : 0,
        results: hack ? [hack] : [],
      });
    }

    const query = {
      registerationEndTimeUnix: { $gt: Math.floor(Date.now() / 1000) }
    };
    if (host) {
      Object.assign(query, { host: { $in: host.split(",") } });
    }

    const hacks = await UpcomingHackathon.find(query)
      .select("-__v")
      .sort({ hackathonStartTimeUnix: 1 });

    return res.status(200).json({ total: hacks.length, results: hacks });
  } catch (err) {
    console.error("Error fetching hackathons", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

