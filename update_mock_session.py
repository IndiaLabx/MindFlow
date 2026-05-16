import re

with open('src/features/quiz/mock/MockSession.tsx', 'r') as f:
    content = f.read()

replacement = """    const currentQuestion = questions[currentIndex];

    // Safety check: if question is undefined, we shouldn't attempt to render
    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Loading Question...</h2>
                </div>
            </div>
        );
    }

    const userAnswer = answers[currentQuestion.id];"""

content = content.replace("    const currentQuestion = questions[currentIndex];\n    const userAnswer = answers[currentQuestion.id];", replacement)

with open('src/features/quiz/mock/MockSession.tsx', 'w') as f:
    f.write(content)
