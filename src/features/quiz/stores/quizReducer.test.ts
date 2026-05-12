
import { describe, it, expect } from 'vitest';
import { quizReducer, initialState } from './quizReducer';
import { QuizState } from '../types/store';

describe('quizReducer', () => {
    it('should handle PAUSE_QUIZ correctly', () => {
        const state: QuizState = {
            ...initialState,
            status: 'quiz',
            remainingTimes: { 'q1': 60 }
        };

        const action = {
            type: 'PAUSE_QUIZ' as const,
            payload: { questionId: 'q1', remainingTime: 45 }
        };

        const newState = quizReducer(state, action);

        expect(newState.isPaused).toBe(true);
        expect(newState.remainingTimes['q1']).toBe(45);
    });

    it('should handle PAUSE_QUIZ without payload updates', () => {
        const state: QuizState = {
            ...initialState,
            status: 'quiz',
            remainingTimes: { 'q1': 60 }
        };

        const action = {
            type: 'PAUSE_QUIZ' as const,
            payload: {}
        };

        const newState = quizReducer(state, action);

        expect(newState.isPaused).toBe(true);
        expect(newState.remainingTimes['q1']).toBe(60); // Should remain unchanged
    });

    it('should handle RESUME_QUIZ correctly', () => {
        const state: QuizState = {
            ...initialState,
            status: 'quiz',
            isPaused: true
        };

        const action = {
            type: 'RESUME_QUIZ' as const
        };

        const newState = quizReducer(state, action);

        expect(newState.isPaused).toBe(false);
    });

    it('should deduplicate activeQuestions when handling LOAD_SAVED_QUIZ', () => {
        const duplicateQuestion = {
            id: 'q1',
            question: 'Question 1',
            options: ['A', 'B'],
            correct: 'A',
            sourceInfo: { examName: 'Test', examYear: 2023 },
            classification: { subject: 'Test', topic: 'Test' },
            tags: [],
            properties: { difficulty: 'Easy', questionType: 'MCQ' },
            explanation: {}
        };

        const savedState: QuizState = {
            ...initialState,
            status: 'quiz',
            activeQuestions: [duplicateQuestion, duplicateQuestion] as any
        };

        const action = {
            type: 'LOAD_SAVED_QUIZ' as const,
            payload: savedState
        };

        const newState = quizReducer(initialState, action);

        expect(newState.activeQuestions).toHaveLength(1);
        expect(newState.activeQuestions[0].id).toBe('q1');
    });
});
