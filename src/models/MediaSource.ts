import mongoose, { Schema } from "mongoose";
import { IMediaSource } from "../types";

const mediaSourceSchema = new Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["movie", "tvshow", "other"],
    required: true,
  },
  season: Number,
  episode: Number,
  year: Number,
  genre: [String],
  language: { type: String, default: "en" },
  srtFilePath: String,
  processedAt: { type: Date, default: Date.now },
  wordCount: { type: Number, default: 0 },
});

export default mongoose.model("MediaSource", mediaSourceSchema);
