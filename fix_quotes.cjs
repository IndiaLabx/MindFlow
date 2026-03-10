const fs = require('fs');
let vocab = fs.readFileSync('src/features/quiz/components/VocabQuizHome.tsx', 'utf8');

vocab = vocab.replace(
  "icon: <BookOpen className=\\\"w-6 h-6 text-emerald-600\\\" />",
  "icon: <BookOpen className=\"w-6 h-6 text-emerald-600\" />"
);

fs.writeFileSync('src/features/quiz/components/VocabQuizHome.tsx', vocab);
