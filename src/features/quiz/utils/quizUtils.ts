import { Question } from '../../../types/models';

/**
 * Deduplicates a list of questions based on their unique identifier.
 * Useful during state hydration to prevent accumulation bugs.
 *
 * @param questions - The array of questions to deduplicate.
 * @returns A new array containing only unique questions.
 */
export const deduplicateQuestions = (questions: Question[]): Question[] => {
  if (!questions || !Array.isArray(questions)) return questions;
  return Array.from(new Map(questions.map(q => [q.id, q])).values());
};
