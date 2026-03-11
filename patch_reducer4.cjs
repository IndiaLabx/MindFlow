const fs = require('fs');
const file = 'src/features/quiz/stores/quizReducer.ts';
let code = fs.readFileSync(file, 'utf8');

const regex1 = /\s*\/\/ Stay on last card if flashcards \(wait for explicit finish\)[\s\S]*?return state;\s*\n\s*\}/;
code = code.replace(regex1, '');

const regex2 = /\s*return \{ \.\.\.state, status: 'flashcards-complete' \};/;
code = code.replace(regex2, '');

fs.writeFileSync(file, code);
