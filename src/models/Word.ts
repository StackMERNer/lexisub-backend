import mongoose, { Schema } from "mongoose";
import { IWord } from "../types";

const wordSchema = new Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  definitions: [
    {
      partOfSpeech: String,
      meaning: String,
      example: String,
    },
  ],
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "intermediate",
  },
  frequency: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Word", wordSchema);
