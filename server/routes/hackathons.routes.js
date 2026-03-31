import express from "express";
import authMiddleware from "../middleware/auth.js";
import { UpcomingHackathon, AllHackathon } from "../models/Hackathon.js";
import Metadata from "../models/Metadata.js";

const router = express.Router();

const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function refreshHackathons() {
  console.log("Refreshing hackathons from Devfolio...");
  const newHacks = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch("https://api.devfolio.co/api/hackathons?page=1&limit=50", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await res.json();
    
    if (data.result && Array.isArray(data.result)) {
      console.log(`Processing ${data.result.length} hackathons from Devfolio...`);
      data.result.forEach((h, index) => {
        try {
          const start = new Date(h.starts_at).getTime();
          const end = new Date(h.ends_at).getTime();
          const regStart = h.registration_starts_at ? new Date(h.registration_starts_at).getTime() : start;
          const regEnd = h.registration_ends_at ? new Date(h.registration_ends_at).getTime() : start;

          if (!h.starts_at || !h.ends_at) {
            console.warn(`Skipping hackathon ${h.name} due to missing dates.`);
            return;
          }

          newHacks.push({
            host: "devfolio",
            name: h.name,
            vanity: h.slug,
            url: `https://${h.slug}.devfolio.co/`,
            registerationStartTimeUnix: Math.floor(regStart / 1000),
            registerationEndTimeUnix: Math.floor(regEnd / 1000),
            hackathonStartTimeUnix: Math.floor(start / 1000),
            duration: Math.round((end - start) / 60000)
          });
        } catch (e) {
          console.error(`Error processing hackathon at index ${index}:`, e.message);
        }
      });
    }
  } catch (err) { console.error("Devfolio Refresh Error:", err.message); }

  if (newHacks.length > 0) {
    await UpcomingHackathon.deleteMany({});
    await UpcomingHackathon.insertMany(newHacks);
    
    for (const h of newHacks) {
      await AllHackathon.updateOne({ url: h.url }, { $set: h }, { upsert: true });
    }
  }

  await Metadata.updateOne(
    { key: "global_meta" },
    { $set: { lastRefreshHackathons: new Date() } },
    { upsert: true }
  );
  console.log(`Successfully refreshed ${newHacks.length} hackathons.`);
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

    const query = {};
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

