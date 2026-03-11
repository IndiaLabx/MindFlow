const fs = require('fs');
const file = 'src/features/quiz/stores/quizReducer.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /\s*if \(state\.status === 'flashcards' \|\| state\.status === 'ows-flashcards'\) \{\s*\n\s*return \{\s*\n\s*\.\.\.state,\s*\n\s*status: 'flashcards-complete'\s*\n\s*\};\s*\n\s*\}/;
code = code.replace(regex, '');

fs.writeFileSync(file, code);
