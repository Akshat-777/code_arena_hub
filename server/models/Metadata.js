import mongoose from "mongoose";

const metadataSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    lastRefreshContests: {
      type: Date,
      default: null,
    },
    lastRefreshHackathons: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Metadata = mongoose.model("Metadata", metadataSchema, "metadata");

export default Metadata;
