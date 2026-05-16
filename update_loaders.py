import re

with open('src/features/quiz/components/SavedQuizzes.tsx', 'r') as f:
    content = f.read()

replacement = """    const loadQuizzes = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setQuizzes([]);
                return;
            }

            const { data, error } = await supabase
              .from('saved_quizzes')
              .select('*, bridge_saved_quiz_questions(question_id, sort_order)')
              .eq('user_id', session.user.id)
              .is('deleted_at', null)
              .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching saved quizzes:', error);
                return;
            }

            if (data && data.length > 0) {
                // Filter status dynamically in memory to handle edge cases where the DB structure holds result state inside jsonb
                const activeQuizzes = data.filter(rq => rq.state?.status !== 'result');

                const allQuestionIds = new Set<string>();
                activeQuizzes.forEach(rq => {
                    const bridgeData = rq.bridge_saved_quiz_questions || [];
                    bridgeData.forEach((bq: any) => allQuestionIds.add(bq.question_id));
                });

                const idArray = Array.from(allQuestionIds);
                if (idArray.length > 0) {
                     const { data: qData } = await supabase.from('study_materials').select('*').in('id', idArray);
                     const questionsMap = new Map((qData || []).map(q => [q.id, q]));

                     const mappedQuizzes = activeQuizzes.map(rq => {
                          let questions: any[] = [];
                          const bridgeData = rq.bridge_saved_quiz_questions || [];
                          bridgeData.sort((a: any, b: any) => a.sort_order - b.sort_order);
                          bridgeData.forEach((bq: any) => {
                              const q = questionsMap.get(bq.question_id);
                              if (q) questions.push(q);
                          });

                          return {
                              id: rq.id,
                              name: rq.name,
                              createdAt: new Date(rq.created_at).getTime(),
                              filters: rq.filters,
                              mode: rq.mode,
                              questions: questions,
                              state: {
                                  ...(rq.state || {}),
                                  activeQuestions: questions
                              }
                          };
                     });

                     setQuizzes(mappedQuizzes);
                } else {
                     setQuizzes([]);
                }
            } else {
                setQuizzes([]);
            }
        } catch (error) {
            console.error("Failed to load quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger load on mount and when sync completes
    useEffect(() => {
        loadQuizzes();
    }, []);
"""

# I need to match everything from const loadQuizzes = async () => { to };
pattern = r'    const loadQuizzes = async \(\) => \{\n        try \{\n            const data: any\[\] = \[\];.*?        \}\n    \};'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/features/quiz/components/SavedQuizzes.tsx', 'w') as f:
    f.write(content)
