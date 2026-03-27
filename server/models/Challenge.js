import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    host: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    vanity: { type: String, required: true, lowercase: true },
    url: { type: String, required: true, unique: true },
    startTimeUnix: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // minutes
    difficulty: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema, "challenges");

export default Challenge;

