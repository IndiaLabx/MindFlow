import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { db } from '../../../lib/db';
import { useAuth } from '../context/AuthContext';

export interface ProfileStats {
  quizzesCompleted: number;
  correctAnswers: number;
  averageScore: number;
}

export const useProfileStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    quizzesCompleted: 0,
    correctAnswers: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        let quizzesCompleted = 0;
        let correctAnswers = 0;
        let totalQuestionsAnswered = 0; // Sum of correct and incorrect (not skipped)

        if (user) {
          // Fetch from Supabase for logged-in user
          const { data, error: supabaseError } = await supabase
            .from('quiz_history')
            .select('total_correct, total_incorrect, total_questions')
            .eq('user_id', user.id);

          if (supabaseError) {
            throw supabaseError;
          }

          if (data && data.length > 0) {
            quizzesCompleted = data.length;
            data.forEach((record) => {
              correctAnswers += record.total_correct || 0;
              // Assuming questions answered are correct + incorrect. If skipped are included in total_questions, we should use total_correct + total_incorrect.
              // Let's use total_correct + total_incorrect as "questions answered" to calculate the accuracy.
              totalQuestionsAnswered += (record.total_correct || 0) + (record.total_incorrect || 0);
            });
          }
        } else {
          // Fetch from IndexedDB for guest user
          const localHistory = await db.getQuizHistory();

          if (localHistory && localHistory.length > 0) {
            quizzesCompleted = localHistory.length;
            localHistory.forEach((record) => {
              correctAnswers += record.totalCorrect || 0;
              totalQuestionsAnswered += (record.totalCorrect || 0) + (record.totalIncorrect || 0);
            });
          }
        }

        if (isMounted) {
          let averageScore = 0;
          if (totalQuestionsAnswered > 0) {
            averageScore = Math.round((correctAnswers / totalQuestionsAnswered) * 100);
          }

          setStats({
            quizzesCompleted,
            correctAnswers,
            averageScore,
          });
        }
      } catch (err: any) {
        console.error('Error fetching profile stats:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load statistics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { stats, loading, error };
};
