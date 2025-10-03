import { IUserProgress } from "../types";

interface SpacedRepetitionResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  status: "new" | "learning" | "reviewing" | "mastered";
}

export class SpacedRepetitionService {
  calculateNextReview(
    quality: number,
    progress: IUserProgress
  ): SpacedRepetitionResult {
    let { easeFactor, interval, repetitions } = progress;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    let status: "new" | "learning" | "reviewing" | "mastered" = "learning";
    if (repetitions >= 5 && easeFactor >= 2.5) {
      status = "mastered";
    } else if (repetitions >= 2) {
      status = "reviewing";
    }

    return { easeFactor, interval, repetitions, nextReviewDate, status };
  }
}
