import { Request, Response } from "express";
import { SRTProcessor } from "../services/srtProcessor";
import Word from "../models/Word";
import MediaSource from "../models/MediaSource";
import WordOccurrence from "../models/WordOccurrence";

export const uploadSRT = async (req: Request, res: Response) => {
  try {
    if (!(req as any).file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { title, type, season, episode } = req.body;
    const srtContent = (req as any).file.buffer.toString("utf-8");

    const processor = new SRTProcessor();
    const words = await processor.processAndStore(srtContent);

    const mediaSource = await MediaSource.create({
      title,
      type,
      season: season ? parseInt(season) : undefined,
      episode: episode ? parseInt(episode) : undefined,
      wordCount: words.length,
    });

    const bulkOps = [];

    for (const wordData of words) {
      const word = await Word.findOneAndUpdate(
        { word: wordData.word },
        {
          $inc: { frequency: wordData.occurrences },
          $setOnInsert: { word: wordData.word },
        },
        { upsert: true, new: true }
      );

      bulkOps.push({
        updateOne: {
          filter: { wordId: word._id, mediaSourceId: mediaSource._id },
          update: {
            $set: {
              occurrences: wordData.occurrences,
              contexts: wordData.contexts.slice(0, 5),
            },
          },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) {
      await WordOccurrence.bulkWrite(bulkOps);
    }

    res.status(201).json({
      success: true,
      mediaSourceId: mediaSource._id,
      wordsProcessed: words.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMediaSources = async (req: Request, res: Response) => {
  try {
    const mediaSources = await MediaSource.find()
      .sort({ processedAt: -1 })
      .limit(50);

    res.json({ mediaSources });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
