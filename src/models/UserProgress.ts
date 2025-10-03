import mongoose, { Schema } from "mongoose";
import { IUserProgress } from "../types";

const userProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  wordId: {
    type: Schema.Types.ObjectId,
    ref: "Word",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["new", "learning", "reviewing", "mastered"],
    default: "new",
    index: true,
  },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  lastReviewed: Date,
  nextReviewDate: Date,
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });

export default mongoose.model("UserProgress", userProgressSchema);
