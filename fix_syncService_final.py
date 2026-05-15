import re

with open('src/lib/syncService.ts', 'r') as f:
    content = f.read()

# Make sure quiz properties are removed
content = re.sub(r'const localQuizzes = await db\.getQuizzes\(\);\n', 'const localQuizzes: any[] = [];\n', content)
content = re.sub(r'const localHistory = await db\.getQuizHistory\(\);\n', 'const localHistory: any[] = [];\n', content)
content = re.sub(r'await db\.saveQuiz\(.*?\);\n', '', content)

# Event queue case removal
content = re.sub(r"case 'quiz_completed':.*?break;", "", content, flags=re.DOTALL)
content = re.sub(r"case 'quiz_deleted':.*?break;", "", content, flags=re.DOTALL)


with open('src/lib/syncService.ts', 'w') as f:
    f.write(content)
