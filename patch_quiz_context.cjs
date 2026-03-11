const fs = require('fs');
const file = 'src/features/quiz/context/QuizContext.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove flashcard action types from Context
code = code.replace(/startFlashcards: \(data: Idiom\[\], filters: InitialFilters\) => void;\s*\n/g, '');
code = code.replace(/startOWSFlashcards: \(data: OneWord\[\], filters: InitialFilters\) => void;\s*\n/g, '');
code = code.replace(/startSynonymFlashcards: \(data: SynonymWord\[\], filters: InitialFilters\) => void;\s*\n/g, '');
code = code.replace(/finishFlashcards: \(\) => void;\s*\n/g, '');

// Also clean up imports if needed but it's okay to leave unused ones for now. Let's run TSC.
fs.writeFileSync(file, code);

const file2 = 'src/features/quiz/hooks/useQuiz.ts';
let code2 = fs.readFileSync(file2, 'utf8');

code2 = code2.replace(/const startFlashcards = useCallback\(\(data: Idiom\[\], filters: InitialFilters\) => \{\s*\n\s*dispatch\(\{ type: 'START_FLASHCARDS', payload: \{ idioms: data, filters \} \}\);\s*\n\s*\}, \[\]\);\s*\n/g, '');
code2 = code2.replace(/const startOWSFlashcards = useCallback\(\(data: OneWord\[\], filters: InitialFilters\) => \{\s*\n\s*dispatch\(\{ type: 'START_OWS_FLASHCARDS', payload: \{ data, filters \} \}\);\s*\n\s*\}, \[\]\);\s*\n/g, '');
code2 = code2.replace(/const startSynonymFlashcards = useCallback\(\(data: SynonymWord\[\], filters: InitialFilters\) => \{\s*\n\s*dispatch\(\{ type: 'START_SYNONYM_FLASHCARDS', payload: \{ data, filters \} \}\);\s*\n\s*\}, \[\]\);\s*\n/g, '');
code2 = code2.replace(/const finishFlashcards = useCallback\(\(\) => \{\s*\n\s*dispatch\(\{ type: 'FINISH_FLASHCARDS' \}\);\s*\n\s*\}, \[\]\);\s*\n/g, '');

code2 = code2.replace(/startFlashcards,\s*\n/g, '');
code2 = code2.replace(/startOWSFlashcards,\s*\n/g, '');
code2 = code2.replace(/startSynonymFlashcards,\s*\n/g, '');
code2 = code2.replace(/finishFlashcards,\s*\n/g, '');

fs.writeFileSync(file2, code2);
