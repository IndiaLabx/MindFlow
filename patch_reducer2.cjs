const fs = require('fs');
const file = 'src/features/quiz/stores/quizReducer.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /\s*\/\/ If restarting flashcards \(Idioms or OWS\)[\s\S]*?currentQuestionIndex: 0\s*\n\s*\};\s*\n\s*\}/;
code = code.replace(regex, '');

fs.writeFileSync(file, code);
