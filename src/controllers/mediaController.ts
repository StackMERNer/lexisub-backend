import { Request, Response } from "express";
import { SRTProcessor } from "../services/srtProcessor";
import { DictionaryService } from "../services/dictionaryService";
import Word from "../models/Word";
import MediaSource from "../models/MediaSource";
import WordOccurrence from "../models/WordOccurrence";

const dictionaryService = new DictionaryService();

export const uploadSRT = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { title, type, season, episode } = req.body;
    const srtContent = req.file.buffer.toString("utf-8");

    const processor = new SRTProcessor();
    const words = await processor.processAndStore(srtContent);

    const mediaSource = await MediaSource.create({
      title,
      type,
      season: season ? parseInt(season) : undefined,
      episode: episode ? parseInt(episode) : undefined,
      wordCount: words.length,
    });

    // Fetch definitions for new words only
    const uniqueWords = words.map((w) => w.word);
    const existingWords = await Word.find({
      word: { $in: uniqueWords },
    }).select("word");
    const existingWordSet = new Set(existingWords.map((w) => w.word));

    const newWords = uniqueWords.filter((w) => !existingWordSet.has(w));

    console.log(`Fetching definitions for ${newWords.length} new words...`);
    const definitionsMap = await dictionaryService.fetchDefinitions(newWords);

    const bulkOps = [];

    for (const wordData of words) {
      const definitions = definitionsMap.get(wordData.word) || [];

      // Find or create word with definitions
      const word = await Word.findOneAndUpdate(
        { word: wordData.word },
        {
          $inc: { frequency: wordData.occurrences },
          $setOnInsert: {
            word: wordData.word,
            definitions: definitions,
          },
        },
        { upsert: true, new: true }
      );

      // Create word occurrence
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
      definitionsFetched: definitionsMap.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMediaSources = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const mediaSources = await MediaSource.find()
      .sort({ processedAt: -1 })
      .limit(50);

    res.json({ mediaSources });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchMissingDefinitions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Find words without definitions
    const wordsWithoutDefinitions = await Word.find({
      $or: [{ definitions: { $exists: false } }, { definitions: { $size: 0 } }],
    }).limit(100);

    if (wordsWithoutDefinitions.length === 0) {
      res.json({ message: "All words have definitions", updated: 0 });
      return;
    }

    console.log(
      `Fetching definitions for ${wordsWithoutDefinitions.length} words...`
    );

    const words = wordsWithoutDefinitions.map((w) => w.word);
    const definitionsMap = await dictionaryService.fetchDefinitions(words);

    let updated = 0;
    for (const wordDoc of wordsWithoutDefinitions) {
      const definitions = definitionsMap.get(wordDoc.word);
      if (definitions && definitions.length > 0) {
        (wordDoc as any).definitions = definitions;
        await wordDoc.save();
        updated++;
      }
    }

    res.json({
      message: `Fetched definitions for ${updated} words`,
      total: wordsWithoutDefinitions.length,
      updated,
    });
  } catch (error: any) {
    console.error("Error fetching definitions:", error);
    res.status(500).json({ error: error.message });
  }
};
