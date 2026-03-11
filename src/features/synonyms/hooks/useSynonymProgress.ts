import { useState, useCallback, useEffect } from 'react';
import { SynonymWord } from '../../quiz/types';

// Extend the progress interface to support string-based familiar keys
interface SynonymProgress {
  mastered: Record<string, boolean>; // word ID -> true
  familiar: Record<string, boolean>; // lowercase word string -> true
}

const STORAGE_KEY = 'mindflow_synonym_progress_v2'; // Bumped version for new format

export const useSynonymProgress = () => {
  const [progress, setProgress] = useState<SynonymProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse synonym progress from local storage', e);
    }
    return { mastered: {}, familiar: {} };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save synonym progress to local storage', e);
    }
  }, [progress]);

  /**
   * Marks a specific word as mastered and ALL OTHER words in its cluster as familiar.
   * Does NOT overwrite existing mastered states.
   */
  const markMastered = useCallback((wordObj: SynonymWord, clusterWords: string[] = []) => {
    setProgress((prev) => {
      const newMastered = { ...prev.mastered };
      const newFamiliar = { ...prev.familiar };

      // 1. Mark the target word as mastered
      newMastered[wordObj.id] = true;

      // 2. Mark its direct synonyms as familiar (legacy support / safety)
      wordObj.synonyms?.forEach(syn => {
         const synNormalized = syn.text.toLowerCase().trim();
         newFamiliar[synNormalized] = true;
      });

      // 3. Mark all provided cluster words as familiar
      clusterWords.forEach(wordStr => {
        const normalized = wordStr.toLowerCase().trim();
        newFamiliar[normalized] = true;
      });

      return { mastered: newMastered, familiar: newFamiliar };
    });
  }, []);

  /**
   * Determines the status of a word object or string.
   */
  const getStatus = useCallback((wordObjOrStr: SynonymWord | string, wordId?: string): 'mastered' | 'familiar' | 'new' => {
    let normalizedStr = '';
    let idToCheck = wordId;

    if (typeof wordObjOrStr === 'string') {
       normalizedStr = wordObjOrStr.toLowerCase().trim();
    } else {
       normalizedStr = wordObjOrStr.word.toLowerCase().trim();
       idToCheck = wordObjOrStr.id;
    }

    // Check Mastered first (requires ID)
    if (idToCheck && progress.mastered[idToCheck]) return 'mastered';

    // Check Familiar
    if (progress.familiar[normalizedStr]) return 'familiar';

    return 'new';
  }, [progress]);

  const clearProgress = useCallback(() => {
    setProgress({ mastered: {}, familiar: {} });
  }, []);

  return {
    progress,
    markMastered,
    getStatus,
    clearProgress
  };
};
