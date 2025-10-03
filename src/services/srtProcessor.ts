import natural from "natural";
import * as stopword from "stopword";
import srtParser2 from "srt-parser-2";
import { ExtractedWord } from "../types";

export class SRTProcessor {
  private parser: any;
  private tokenizer: any;

  constructor() {
    this.parser = new srtParser2();
    this.tokenizer = new natural.WordTokenizer();
  }

  parseSRT(srtContent: string): any[] {
    return this.parser.fromSrt(srtContent);
  }

  extractWords(subtitles: any[]): ExtractedWord[] {
    const wordMap = new Map();

    subtitles.forEach((subtitle) => {
      const text = subtitle.text
        .toLowerCase()
        .replace(/]*>/g, "")
        .replace(/[^\w\s'-]/g, " ");

      const tokens: string[] = this.tokenizer.tokenize(text);
      const filteredTokens = stopword.removeStopwords(tokens);

      filteredTokens.forEach((token) => {
        if (token.length >= 3 && /^[a-z'-]+$/.test(token)) {
          if (!wordMap.has(token)) {
            wordMap.set(token, {
              word: token,
              occurrences: 1,
              contexts: [
                {
                  text: subtitle.text,
                  timestamp: subtitle.startTime,
                },
              ],
            });
          } else {
            const existing = wordMap.get(token)!;
            existing.occurrences++;
            if (existing.contexts.length < 5) {
              existing.contexts.push({
                text: subtitle.text,
                timestamp: subtitle.startTime,
              });
            }
          }
        }
      });
    });

    return Array.from(wordMap.values());
  }

  async processAndStore(srtContent: string) {
    const subtitles = this.parseSRT(srtContent);
    return this.extractWords(subtitles);
  }
}
