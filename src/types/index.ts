import { Document, Types } from "mongoose";

export interface IWord extends Document {
  word: string;
  definitions: {
    partOfSpeech: string;
    meaning: string;
    example: string;
  }[];
  difficulty: "beginner" | "intermediate" | "advanced";
  frequency: number;
  createdAt: Date;
}

export interface IMediaSource extends Document {
  title: string;
  type: "movie" | "tvshow" | "other";
  season?: number;
  episode?: number;
  year?: number;
  genre: string[];
  language: string;
  srtFilePath?: string;
  processedAt: Date;
  wordCount: number;
}

export interface IWordOccurrence extends Document {
  wordId: Types.ObjectId;
  mediaSourceId: Types.ObjectId;
  occurrences: number;
  contexts: {
    text: string;
    timestamp: string;
  }[];
}

export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  wordId: Types.ObjectId;
  status: "new" | "learning" | "reviewing" | "mastered";
  correctCount: number;
  incorrectCount: number;
  lastReviewed?: Date;
  nextReviewDate?: Date;
  easeFactor: number;
  interval: number;
  repetitions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash: string;
  preferences: {
    dailyGoal: number;
    difficulty: string;
    language: string;
  };
  stats: {
    totalWordsLearned: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: Date;
  };
  createdAt: Date;
}

export interface ExtractedWord {
  word: string;
  occurrences: number;
  contexts: {
    text: string;
    timestamp: string;
  }[];
}
