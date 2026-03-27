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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;

