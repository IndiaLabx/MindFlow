import re

with open('src/lib/syncService.ts', 'r') as f:
    content = f.read()

content = re.sub(r'await db\.saveQuiz\(.*?\}\);', '', content, flags=re.DOTALL)

with open('src/lib/syncService.ts', 'w') as f:
    f.write(content)
