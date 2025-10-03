import { Request, Response } from "express";
import UserProgress from "../models/UserProgress";
import { SpacedRepetitionService } from "../services/spacedRepetition";

const srService = new SpacedRepetitionService();

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { userId, wordId, correct } = req.body;

    if (!userId || !wordId || correct === undefined) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const quality = correct ? 5 : 2;

    let progress = await UserProgress.findOne({ userId, wordId });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        wordId,
        correctCount: correct ? 1 : 0,
        incorrectCount: correct ? 0 : 1,
        lastReviewed: new Date(),
      });
    } else {
      progress.correctCount += correct ? 1 : 0;
      progress.incorrectCount += correct ? 0 : 1;
      progress.lastReviewed = new Date();
      progress.updatedAt = new Date();
    }

    const nextReview = srService.calculateNextReview(quality, progress as any);

    progress.easeFactor = nextReview.easeFactor;
    progress.interval = nextReview.interval;
    progress.repetitions = nextReview.repetitions;
    progress.nextReviewDate = nextReview.nextReviewDate;
    progress.status = nextReview.status;

    await progress.save();

    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const stats = await UserProgress.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalWords = await UserProgress.countDocuments({ userId });
    const mastered = stats.find((s) => s._id === "mastered")?.count || 0;
    const learning = stats.find((s) => s._id === "learning")?.count || 0;
    const reviewing = stats.find((s) => s._id === "reviewing")?.count || 0;

    res.json({
      totalWords,
      mastered,
      learning,
      reviewing,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
