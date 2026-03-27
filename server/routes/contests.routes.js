import express from "express";
import authMiddleware from "../middleware/auth.js";
import { UpcomingContest, AllContest } from "../models/Contest.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
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

