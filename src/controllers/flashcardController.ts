import { Request, Response } from "express";
import UserProgress from "../models/UserProgress";
import Word from "../models/Word";

export const getFlashcards = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const learnedWordIds = await UserProgress.find({
      userId,
      status: "mastered",
    }).distinct("wordId");

    const now = new Date();
    const dueForReview = await UserProgress.find({
      userId,
      status: { $in: ["learning", "reviewing"] },
      nextReviewDate: { $lte: now },
    })
      .populate("wordId")
      .limit(Math.floor(limit / 2));

    const newWordsCount = limit - dueForReview.length;
    const newWords = await Word.find({
      _id: { $nin: learnedWordIds },
    })
      .sort({ frequency: -1 })
      .limit(newWordsCount);

    const flashcards = [
      ...dueForReview.map((up) => ({
        word: up.wordId,
        progress: {
          status: up.status,
          correctCount: up.correctCount,
          incorrectCount: up.incorrectCount,
        },
        isReview: true,
      })),
      ...newWords.map((word) => ({
        word,
        progress: null,
        isReview: false,
      })),
    ];

    res.json({ flashcards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
