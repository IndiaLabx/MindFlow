import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizSessionStore } from '../stores/useQuizSessionStore';
import { supabase } from '../../../lib/supabase';
import { SynapticLoader } from '../../../components/ui/SynapticLoader';

export const QuizSessionGuard = ({ children }: { children: React.ReactNode }) => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const state = useQuizSessionStore();
    const [isHydrating, setIsHydrating] = useState(true);

    useEffect(() => {
        const hydrateQuiz = async () => {
            if (!quizId) {
                navigate('/quiz/saved');
                return;
            }

            // If the store is already active with this specific quiz, we can skip hydration
            if (state.quizId === quizId && state.activeQuestions && state.activeQuestions.length > 0) {
                setIsHydrating(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    navigate('/dashboard');
                    return;
                }

                const { data: quizData, error } = await supabase
                    .from('saved_quizzes')
                    .select('*, bridge_saved_quiz_questions(question_id, sort_order)')
                    .eq('id', quizId)
                    .single();

                if (error || !quizData) {
                    console.error("Failed to fetch quiz for hydration:", error);
                    navigate('/quiz/saved');
                    return;
                }

                // If auth uid doesn't match the owner, bounce them out (share functionality comes in the next component)
                if (quizData.user_id !== session.user.id) {
                    navigate('/quiz/saved');
                    return;
                }

                const bridgeData = quizData.bridge_saved_quiz_questions || [];
                bridgeData.sort((a: any, b: any) => a.sort_order - b.sort_order);
                const questionIds = bridgeData.map((bq: any) => bq.question_id);

                if (questionIds.length > 0) {
                    const { data: qData } = await supabase
                        .from('study_materials')
                        .select('*')
                        .in('id', questionIds);

                    const questionsMap = new Map((qData || []).map(q => [q.id, q]));

                    const fullQuestions: any[] = [];
                    bridgeData.forEach((bq: any) => {
                        const q = questionsMap.get(bq.question_id);
                        if (q) fullQuestions.push(q);
                    });

                    // Load into Zustand Store
                    state.loadSavedQuiz({
                        ...(quizData.state || {}),
                        activeQuestions: fullQuestions,
                        isPaused: false
                    });
                }

                setIsHydrating(false);
            } catch (err) {
                console.error("Hydration error:", err);
                navigate('/quiz/saved');
            }
        };

        hydrateQuiz();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    if (isHydrating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <SynapticLoader size="lg" />
                <p className="mt-4 text-gray-500">Loading your quiz session...</p>
            </div>
        );
    }

    return <>{children}</>;
};
