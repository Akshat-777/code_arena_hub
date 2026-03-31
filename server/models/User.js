import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    profile: {
      bio: { type: String, default: "" },
      location: { type: String, default: "" },
      website: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      leetcode: { type: String, default: "" },
      codeforces: { type: String, default: "" },
      codechef: { type: String, default: "" },
      skills: { type: [String], default: [] },
    },
    cachedStats: {
      leetcode: { rating: { type: Number, default: 0 }, solved: { type: Number, default: 0 } },
      codeforces: { rating: { type: Number, default: 0 }, solved: { type: Number, default: 0 } },
      codechef: { rating: { type: Number, default: 0 }, solved: { type: Number, default: 0 } },
    },
    globalScore: { type: Number, default: 0, index: true },
    lastStatsUpdate: { type: Date },
    fullStatsCache: { type: Object },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;

