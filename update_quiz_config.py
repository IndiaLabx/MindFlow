with open('src/features/quiz/components/QuizConfig.tsx', 'r') as f:
    content = f.read()

target = '''        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 cursor-pointer hover:text-indigo-600 dark:text-indigo-400 w-fit" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">HOME</span>
        </div>'''

replacement = '''        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 cursor-pointer hover:text-indigo-600 dark:text-indigo-400 w-fit" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open('src/features/quiz/components/QuizConfig.tsx', 'w') as f:
        f.write(content)
    print("Successfully replaced HOME with Back")
else:
    print("Target string not found in file")
