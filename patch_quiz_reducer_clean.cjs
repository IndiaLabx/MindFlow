const fs = require('fs');
const file = 'src/features/quiz/stores/quizReducer.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove flashcard specific types and properties from QuizState interface.
// Wait, they are in src/features/quiz/types/store.ts!
