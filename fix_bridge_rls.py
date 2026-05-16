import re

with open('src/features/quiz/components/QuizConfig.tsx', 'r') as f:
    content = f.read()

replacement = """      // 2. Insert into bridge_saved_quiz_questions
      const bridgeData = newQuiz.questions.map((q, index) => ({
        quiz_id: newQuiz.id,
        question_id: q.id,
        sort_order: index,
        user_id: userId // Add user_id so RLS allows the insert
      }));"""

content = re.sub(r'      // 2\. Insert into bridge_saved_quiz_questions\n      const bridgeData = newQuiz\.questions\.map\(\(q, index\) => \(\{\n        quiz_id: newQuiz\.id,\n        question_id: q\.id,\n        sort_order: index,\n      \}\)\);', replacement, content)

with open('src/features/quiz/components/QuizConfig.tsx', 'w') as f:
    f.write(content)
