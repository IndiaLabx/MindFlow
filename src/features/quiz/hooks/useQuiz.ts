import { useCallback, useEffect, useState } from 'react';
import { useSyncStore } from '../stores/useSyncStore';
import { useAnalyticsStore } from '../stores/useAnalyticsStore';
import { logEvent } from '../services/analyticsService';
import { APP_CONFIG } from '../../../constants/config';
import { useQuizSessionStore } from '../stores/useQuizSessionStore';
import { Question, InitialFilters, QuizMode, Idiom, OneWord, SynonymWord, QuizState, QuizHistoryRecord, SubjectStats } from '../types';
import { db } from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook to manage the global quiz application state.
 *
 * This hook acts as the central controller for the application logic. It proxies to `useQuizSessionStore`
 * to maintain 100% backward compatibility for all consuming components, while migrating the internal state
 * from `useReducer` to `Zustand`.
 *
 * @returns {object} An object containing the current `state`, derived properties (like `currentQuestion`), and action methods.
 */
export const useQuiz = () => {
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Directly bind state and actions from the Zustand store
  const state = useQuizSessionStore();

  // Persistence Effect 1: LocalStorage (Active Session) - Lightweight Metadata Only
  useEffect(() => {
    if (state.status === 'quiz' || state.status === 'result' || state.status === 'flashcards' || state.status === 'ows-flashcards' || state.status === 'flashcards-complete') {
      // ONLY store lightweight metadata in synchronous LocalStorage to avoid UI blocking.
      // The full payload is handled asynchronously by IndexedDB below.
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.QUIZ_SESSION, JSON.stringify({ status: state.status, quizId: state.quizId, mode: state.mode }));
    } else if (state.status === 'idle' || state.status === 'intro') {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.QUIZ_SESSION);
    }
  }, [state.status, state.quizId, state.mode]);

  // Persistence Effect 2: IndexedDB (Saved Quizzes) - Instant Async Commits & Safety Nets
  useEffect(() => {
    if (state.quizId && (state.status === 'quiz' || state.status === 'result')) {
      const saveToDb = async () => {
        const stateToSave = { ...state };
        Object.keys(stateToSave).forEach(key => {
          if (typeof (stateToSave as any)[key] === 'function') {
            delete (stateToSave as any)[key];
          }
        });

        try {
          await db.updateQuizProgress(state.quizId!, stateToSave as any);
        } catch (err) {
          console.error("Failed to auto-save to DB:", err);
        }
      };

      // 1. Instant Async Commit (No more setTimeout death window)
      saveToDb();

      // 2. Ironclad Safety Nets (Interceptors)
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
         // Force a final synchronous-like flush if possible, or at least trigger it.
         // Modern browsers restrict what can be done here, but IndexedDB might squeeze through.
         saveToDb();
      };

      const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden') {
              saveToDb();
          }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [
    state.status, state.mode, state.currentQuestionIndex, state.score,
    state.answers, state.timeTaken, state.remainingTimes, state.quizTimeRemaining,
    state.bookmarks, state.markedForReview, state.hiddenOptions, state.activeQuestions,
    state.filters, state.isPaused, state.quizId
  ]);

  // Wrap startQuiz to include analytics
  const startQuiz = useCallback((filteredQuestions: Question[], filters: InitialFilters, mode: QuizMode = 'learning') => {
    logEvent('quiz_started', {
      subject: filters.subject,
      difficulty: filters.difficulty,
      question_count: filteredQuestions.length,
      mode: mode
    });
    state.startQuiz(filteredQuestions, filters, mode);
  }, [state.startQuiz]);

  // Wrap submitSessionResults to include complex logic previously in useQuiz
  const submitSessionResults = useCallback((results: { answers: Record<string, string>, timeTaken: Record<string, number>, score: number, bookmarks: string[] }) => {
    logEvent('quiz_completed', {
      score: results.score,
      total_questions: state.activeQuestions.length,
      mode: state.mode
    });

    const subjectStats: Record<string, SubjectStats> = {};
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalSkipped = 0;
    let totalTimeSpent = 0;

    state.activeQuestions.forEach(q => {
      const subject = q.classification.subject || 'Unknown';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { attempted: 0, correct: 0, incorrect: 0, skipped: 0, accuracy: 0 };
      }

      const answer = results.answers[q.id];
      const time = results.timeTaken[q.id] || useAnalyticsStore.getState().timeTaken[q.id] || 0;
      totalTimeSpent += time;

      if (!answer) {
        totalSkipped++;
        subjectStats[subject].skipped++;
      } else {
        subjectStats[subject].attempted++;
        const isCorrect = answer === q.correct;
        if (isCorrect) {
          totalCorrect++;
          subjectStats[subject].correct++;
        } else {
          totalIncorrect++;
          subjectStats[subject].incorrect++;
        }
      }
    });

    Object.keys(subjectStats).forEach(subj => {
      const stats = subjectStats[subj];
      stats.accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
    });

    const overallAccuracy = state.activeQuestions.length > 0 ? Math.round((totalCorrect / state.activeQuestions.length) * 100) : 0;

    const difficultyStr = Array.isArray(state.filters?.difficulty)
        ? state.filters.difficulty.join(', ')
        : (state.filters?.difficulty || 'Mixed');

    const historyRecord: QuizHistoryRecord = {
      id: uuidv4(),
      date: Date.now(),
      totalQuestions: state.activeQuestions.length,
      totalCorrect,
      totalIncorrect,
      totalSkipped,
      totalTimeSpent,
      overallAccuracy,
      difficulty: difficultyStr,
      subjectStats
    };

    db.saveQuizHistory(historyRecord).catch(err => console.error("Failed to save quiz history", err));

    useSyncStore.getState().addEvent({
      type: 'quiz_completed',
      payload: { history: historyRecord, attempts: [] }
    });

    state.submitSessionResults(results);
  }, [state.activeQuestions, state.mode, state.filters?.difficulty, state.submitSessionResults]);

  const currentQuestion = state.activeQuestions[state.currentQuestionIndex];
  const totalQuestions = state.activeQuestions.length;
  const progress = totalQuestions > 0
    ? ((state.currentQuestionIndex + 1) / totalQuestions) * 100
    : 0;

  return {
    isReviewMode,
    setIsReviewMode,
    state,
    currentQuestion,
    totalQuestions,
    progress,
    enterHome: state.enterHome,
    enterConfig: state.enterConfig,
    enterEnglishHome: state.enterEnglishHome,
    enterIdiomsConfig: state.enterIdiomsConfig,
    enterOWSConfig: state.enterOWSConfig,
    enterSynonymsConfig: state.enterSynonymsConfig,
    enterProfile: state.enterProfile,
    enterLogin: state.enterLogin,
    goToIntro: state.goToIntro,
    startQuiz,
    submitSessionResults,
    answerQuestion: state.answerQuestion,
    logTimeSpent: state.logTimeSpent,
    saveTimer: state.saveTimer,
    syncGlobalTimer: state.syncGlobalTimer,
    nextQuestion: state.nextQuestion,
    prevQuestion: state.prevQuestion,
    jumpToQuestion: state.jumpToQuestion,
    toggleBookmark: state.toggleBookmark,
    toggleReview: state.toggleReview,
    useFiftyFifty: state.useFiftyFifty,
    pauseQuiz: state.pauseQuiz,
    resumeQuiz: state.resumeQuiz,
    finishQuiz: state.finishQuiz,
    restartQuiz: state.restartQuiz,
    goHome: state.goHome,
    loadSavedQuiz: state.loadSavedQuiz,
    reorderActiveQuestions: state.reorderActiveQuestions
  };
};
