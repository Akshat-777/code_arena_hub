import express from "express";
import authMiddleware from "../middleware/auth.js";
import { UpcomingHackathon, AllHackathon } from "../models/Hackathon.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
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

