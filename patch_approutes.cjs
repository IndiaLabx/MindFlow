const fs = require('fs');

const file = 'src/routes/AppRoutes.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
code = code.replace(
  /import \{ QuizProvider, useQuizContext \} from '\.\.\/features\/quiz\/context\/QuizContext';/,
  `import { QuizProvider, useQuizContext } from '../features/quiz/context/QuizContext';\nimport { useFlashcardStore } from '../features/quiz/stores/useFlashcardStore';`
);

// Add hook usage inside AppRoutes
code = code.replace(
  /const navTo = useNavigate\(\);/,
  `const navTo = useNavigate();\n    const flashcardStore = useFlashcardStore();`
);

// Replace actions in config calls
// Idioms
code = code.replace(
  /startFlashcards\(data as any, filters\);/,
  `flashcardStore.startIdioms(data as any, filters);`
);

// Synonyms
code = code.replace(
  /startSynonymFlashcards\(data, filters\);/,
  `flashcardStore.startSynonyms(data, filters);`
);

// OWS
code = code.replace(
  /startOWSFlashcards\(data, filters\);/,
  `flashcardStore.startOWS(data, filters);`
);

// Idioms Session Route props
code = code.replace(
  /data=\{state\.activeIdioms \|\| \[\]\}\s*\n\s*currentIndex=\{state\.currentQuestionIndex\}\s*\n\s*onNext=\{nextQuestion\}\s*\n\s*onPrev=\{prevQuestion\}\s*\n\s*onExit=\{.*?\}\s*\n\s*onFinish=\{.*?\}\s*\n\s*filters=\{state\.filters \|\| \{\} as any\}\s*\n\s*onJump=\{jumpToQuestion\}/,
  `data={flashcardStore.idioms}
                        currentIndex={flashcardStore.currentIndex}
                        onNext={flashcardStore.nextCard}
                        onPrev={flashcardStore.prevCard}
                        onExit={() => navTo('/idioms/config')}
                        onFinish={() => { flashcardStore.finishSession(); navTo('/flashcards/summary'); }}
                        filters={flashcardStore.filters || {} as any}
                        onJump={flashcardStore.jumpToCard}`
);

// Synonyms Session Route props
code = code.replace(
  /data=\{state\.activeSynonyms \|\| \[\]\}\s*\n\s*currentIndex=\{state\.currentQuestionIndex\}\s*\n\s*onNext=\{nextQuestion\}\s*\n\s*onPrev=\{prevQuestion\}\s*\n\s*onExit=\{.*?\}\s*\n\s*onFinish=\{.*?\}\s*\n\s*filters=\{state\.filters \|\| \{\} as any\}\s*\n\s*onJump=\{jumpToQuestion\}/,
  `data={flashcardStore.synonyms}
                        currentIndex={flashcardStore.currentIndex}
                        onNext={flashcardStore.nextCard}
                        onPrev={flashcardStore.prevCard}
                        onExit={() => navTo('/synonyms/config')}
                        onFinish={() => { flashcardStore.finishSession(); navTo('/flashcards/summary'); }}
                        filters={flashcardStore.filters || {} as any}
                        onJump={flashcardStore.jumpToCard}`
);

// OWS Session Route props
code = code.replace(
  /data=\{state\.activeOWS \|\| \[\]\}\s*\n\s*currentIndex=\{state\.currentQuestionIndex\}\s*\n\s*onNext=\{nextQuestion\}\s*\n\s*onPrev=\{prevQuestion\}\s*\n\s*onExit=\{.*?\}\s*\n\s*onFinish=\{.*?\}\s*\n\s*filters=\{state\.filters \|\| \{\} as any\}\s*\n\s*onJump=\{jumpToQuestion\}/,
  `data={flashcardStore.ows}
                        currentIndex={flashcardStore.currentIndex}
                        onNext={flashcardStore.nextCard}
                        onPrev={flashcardStore.prevCard}
                        onExit={() => navTo('/ows/config')}
                        onFinish={() => { flashcardStore.finishSession(); navTo('/flashcards/summary'); }}
                        filters={flashcardStore.filters || {} as any}
                        onJump={flashcardStore.jumpToCard}`
);

fs.writeFileSync(file, code);
