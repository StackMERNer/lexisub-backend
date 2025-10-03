import mongoose, { Schema } from "mongoose";
import { IWordOccurrence } from "../types";

const wordOccurrenceSchema = new Schema({
  wordId: {
    type: Schema.Types.ObjectId,
    ref: "Word",
    required: true,
    index: true,
  },
  mediaSourceId: {
    type: Schema.Types.ObjectId,
    ref: "MediaSource",
    required: true,
    index: true,
  },
  occurrences: { type: Number, default: 1 },
  contexts: [
    {
      text: String,
      timestamp: String,
    },
  ],
});

wordOccurrenceSchema.index({ wordId: 1, mediaSourceId: 1 }, { unique: true });

export default mongoose.model("WordOccurrence", wordOccurrenceSchema);
