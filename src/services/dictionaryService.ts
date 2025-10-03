import axios from "axios";

export interface DictionaryDefinition {
  partOfSpeech: string;
  meaning: string;
  example?: string;
}

export class DictionaryService {
  private apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en";

  async fetchDefinition(word: string): Promise<DictionaryDefinition[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/${word}`);
      const data = response.data[0];

      if (!data || !data.meanings) {
        return [];
      }

      const definitions: DictionaryDefinition[] = [];

      // Get up to 2 meanings from different parts of speech
      for (const meaning of data.meanings.slice(0, 2)) {
        const definition = meaning.definitions[0];

        definitions.push({
          partOfSpeech: meaning.partOfSpeech,
          meaning: definition.definition,
          example: definition.example || undefined,
        });
      }

      return definitions;
    } catch (error) {
      console.error(`Error fetching definition for "${word}":`, error);
      return [];
    }
  }

  async fetchDefinitions(
    words: string[]
  ): Promise<Map<string, DictionaryDefinition[]>> {
    const definitionsMap = new Map<string, DictionaryDefinition[]>();

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);

      const promises = batch.map(async (word) => {
        const definitions = await this.fetchDefinition(word);
        return { word, definitions };
      });

      const results = await Promise.all(promises);

      results.forEach(({ word, definitions }) => {
        if (definitions.length > 0) {
          definitionsMap.set(word, definitions);
        }
      });

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < words.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return definitionsMap;
  }
}
