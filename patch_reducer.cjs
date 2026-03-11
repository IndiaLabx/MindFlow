const fs = require('fs');
const file = 'src/features/quiz/stores/quizReducer.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove properties from initialState
code = code.replace(/activeIdioms: \[\],/g, '');
code = code.replace(/activeOWS: \[\],/g, '');
code = code.replace(/activeSynonyms: \[\],/g, '');

// Remove Action Types
code = code.replace(/\| \{ type: 'START_FLASHCARDS'; payload: \{ idioms: Idiom\[\], filters: InitialFilters \} \}/g, '');
code = code.replace(/\| \{ type: 'START_OWS_FLASHCARDS'; payload: \{ data: OneWord\[\], filters: InitialFilters \} \}/g, '');
code = code.replace(/\| \{ type: 'START_SYNONYM_FLASHCARDS'; payload: \{ data: SynonymWord\[\], filters: InitialFilters \} \}/g, '');
code = code.replace(/\| \{ type: 'FINISH_FLASHCARDS' \}/g, '');

// Remove Switch cases
code = code.replace(
/case 'START_FLASHCARDS': \{[\s\S]*?case 'START_OWS_FLASHCARDS': \{[\s\S]*?case 'START_SYNONYM_FLASHCARDS': \{[\s\S]*?(?=case 'ANSWER_QUESTION':)/,
  ''
);

code = code.replace(
/case 'FINISH_FLASHCARDS': \{\s*\n\s*return \{\s*\n\s*\.\.\.state,\s*\n\s*status: 'flashcards-complete',\s*\n\s*currentQuestionIndex: 0\s*\n\s*\};\s*\n\s*\}/,
''
);

// Fix NEXT_QUESTION logic
const nextQuestionOld = /const maxIndex = state\.status === 'flashcards'[\s\S]*?: state\.activeQuestions\.length;/;
const nextQuestionNew = `const maxIndex = state.activeQuestions.length;`;
code = code.replace(nextQuestionOld, nextQuestionNew);

// Remove flashcard checks in NEXT_QUESTION
code = code.replace(
/\/\/ Stay on last card if flashcards \(wait for explicit finish\)\s*\n\s*if \(state\.status === 'flashcards' \|\| state\.status === 'ows-flashcards' \|\| state\.status === 'synonym-flashcards'\) \{\s*\n\s*return state;\s*\n\s*\}/g,
''
);

// Fix status check in FINISH_QUIZ
code = code.replace(
/if \(state\.status === 'flashcards' \|\| state\.status === 'ows-flashcards' \|\| state\.status === 'synonym-flashcards' \|\| state\.status === 'flashcards-complete'\) return state;/g,
''
);

fs.writeFileSync(file, code);
