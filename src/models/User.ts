import mongoose, { Schema } from "mongoose";
import { IUser } from "../types";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  passwordHash: String,
  preferences: {
    dailyGoal: { type: Number, default: 20 },
    difficulty: { type: String, default: "all" },
    language: { type: String, default: "en" },
  },
  stats: {
    totalWordsLearned: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
