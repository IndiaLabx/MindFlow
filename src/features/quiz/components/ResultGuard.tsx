import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizSessionStore } from '../stores/useQuizSessionStore';
import { supabase } from '../../../lib/supabase';
import { SynapticLoader } from '../../../components/ui/SynapticLoader';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ArrowLeft } from 'lucide-react';

export const ResultGuard = ({ children }: { children: React.ReactNode }) => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const state = useQuizSessionStore();
    const [isHydrating, setIsHydrating] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const hydrateQuiz = async () => {
            if (!quizId) {
                setError("Quiz ID is missing.");
                setIsHydrating(false);
                return;
            }

            // If the store is already active with this specific quiz and status is 'result', we can skip hydration
            if (state.quizId === quizId && state.status === 'result' && state.activeQuestions && state.activeQuestions.length > 0) {
                setIsHydrating(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    setError("Please login to continue.");
                    setIsHydrating(false);
                    return;
                }

                const { data: quizData, error: err } = await supabase
                    .from('saved_quizzes')
                    .select('*, bridge_saved_quiz_questions(question_id, sort_order)')
                    .eq('id', quizId)
                    .single();

                if (err || !quizData) {
                    console.error("Failed to fetch quiz for hydration:", err);
                    setError("Quiz not found or could not be loaded.");
                    setIsHydrating(false);
                    return;
                }

                if (quizData.user_id !== session.user.id) {
                    setError("You do not have permission to view this quiz.");
                    setIsHydrating(false);
                    return;
                }

                const parsedState = typeof quizData.state === 'string' ? JSON.parse(quizData.state) : (quizData.state || {});

                if (parsedState.status !== 'result') {
                     setError("This quiz has not been completed yet.");
                     setIsHydrating(false);
                     return;
                }

                const bridgeData = quizData.bridge_saved_quiz_questions || [];
                bridgeData.sort((a: any, b: any) => a.sort_order - b.sort_order);
                const questionIds = bridgeData.map((bq: any) => bq.question_id);

                if (questionIds.length > 0) {
                    const { data: qData, error: qError } = await supabase
                        .from('questions')
                        .select('*')
                        .in('id', questionIds);

                    if (qError) {
                         console.error("Failed to fetch study materials:", qError);
                         setError("Failed to fetch quiz questions.");
                         setIsHydrating(false);
                         return;
                    }

                    const questionsMap = new Map((qData || []).map(q => [String(q.id), q]));

                    const fullQuestions: any[] = [];
                    bridgeData.forEach((bq: any) => {
                        const q = questionsMap.get(String(bq.question_id));
                        if (q) fullQuestions.push(q);
                    });

                    if (fullQuestions.length === 0) {
                        console.error("Hydration failed: mapped question array is empty. DB IDs might be missing from questions.");
                        setError("Quiz questions are missing.");
                        setIsHydrating(false);
                        return;
                    }

                    // Load into Zustand Store explicitly merging ID
                    state.loadSavedQuiz({
                        ...parsedState,
                        activeQuestions: fullQuestions,
                        quizId: quizId,
                        isPaused: false
                    });
                } else {
                     console.error("Hydration failed: bridge table returned 0 question IDs.");
                     setError("Quiz is empty.");
                     setIsHydrating(false);
                     return;
                }

                setIsHydrating(false);
            } catch (err) {
                console.error("Hydration error:", err);
                setError("An unexpected error occurred while loading the quiz result.");
                setIsHydrating(false);
            }
        };

        hydrateQuiz();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                 <ErrorState
                    message={error}
                    actionText="Go Back to Dashboard"
                    actionIcon={ArrowLeft}
                    onRetry={() => navigate('/dashboard')}
                />
            </div>
        );
    }

    if (isHydrating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <SynapticLoader size="lg" />
                <p className="mt-4 text-gray-500">Loading quiz results...</p>
            </div>
        );
    }

    return <>{children}</>;
};
