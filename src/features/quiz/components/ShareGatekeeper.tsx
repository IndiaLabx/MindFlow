import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { SynapticLoader } from '../../../components/ui/SynapticLoader';

export const ShareGatekeeper = () => {
    const { originalQuizId } = useParams<{ originalQuizId: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Checking authorization...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processSharedQuiz = async () => {
            if (!originalQuizId) {
                navigate('/dashboard');
                return;
            }

            try {
                // 1. Auth Guard
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    // Save intent to redirect back here after login
                    sessionStorage.setItem('mindflow_redirect_intent', `/share/${originalQuizId}`);
                    navigate('/login');
                    return;
                }

                setStatus('Cloning quiz data...');

                // 2. Fetch original quiz data
                const { data: originalQuiz, error: fetchError } = await supabase
                    .from('saved_quizzes')
                    .select('*, bridge_saved_quiz_questions(question_id, sort_order)')
                    .eq('id', originalQuizId)
                    .single();

                if (fetchError || !originalQuiz) {
                    setError('This shared quiz could not be found or has been deleted.');
                    return;
                }

                // If user is actually the owner, just redirect them to their session
                if (originalQuiz.user_id === session.user.id) {
                     navigate(`/quiz/session/${originalQuiz.mode}/${originalQuiz.id}`);
                     return;
                }

                // 3. Clone engine
                const newQuizId = crypto.randomUUID();
                const clonedName = `${originalQuiz.name} (Shared)`;

                // Reset state to empty/0
                const clonedState = {
                    ...originalQuiz.state,
                    quizId: newQuizId,
                    status: 'quiz',
                    answers: {},
                    score: 0,
                    timeTaken: {},
                    remainingTimes: {},
                    isPaused: false
                };

                const { error: insertError } = await supabase.from('saved_quizzes').insert({
                    id: newQuizId,
                    user_id: session.user.id,
                    name: clonedName,
                    created_at: new Date().toISOString(),
                    filters: originalQuiz.filters,
                    mode: originalQuiz.mode,
                    state: clonedState,
                });

                if (insertError) {
                    console.error("Clone insert error:", insertError);
                    setError('Failed to clone the quiz into your account.');
                    return;
                }

                // 4. Clone Bridge Relations
                const bridgeData = originalQuiz.bridge_saved_quiz_questions || [];
                const newBridgeData = bridgeData.map((bq: any) => ({
                    quiz_id: newQuizId,
                    question_id: bq.question_id,
                    sort_order: bq.sort_order,
                    user_id: session.user.id
                }));

                if (newBridgeData.length > 0) {
                    const { error: bridgeError } = await supabase.from('bridge_saved_quiz_questions').insert(newBridgeData);
                    if (bridgeError) {
                        console.error("Clone bridge error:", bridgeError);
                        setError('Failed to clone the questions into your account.');
                        return;
                    }
                }

                // 5. Seamless Redirect to new personal instance
                setStatus('Routing to your session...');
                navigate(`/quiz/session/${originalQuiz.mode}/${newQuizId}`);

            } catch (err) {
                console.error("Fatal clone error:", err);
                setError('An unexpected error occurred while processing the shared link.');
            }
        };

        processSharedQuiz();
    }, [originalQuizId, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Link Invalid</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <SynapticLoader size="xl" />
            <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white animate-pulse">
                {status}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Please wait while we set up your session...</p>
        </div>
    );
};
