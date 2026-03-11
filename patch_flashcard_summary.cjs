const fs = require('fs');
const file = 'src/features/flashcards/components/FlashcardSummary.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace quiz context usage
code = code.replace(
  /import \{ useQuizContext \} from '\.\.\/context\/QuizContext';/,
  `import { useQuizContext } from '../context/QuizContext';\nimport { useFlashcardStore } from '../stores/useFlashcardStore';`
);

code = code.replace(
  /const \{ state, goHome, enterVocabHome \} = useQuizContext\(\);/,
  `const { state, goHome, enterVocabHome } = useQuizContext();\n  const flashcardStore = useFlashcardStore();`
);

// Idioms specific check
code = code.replace(
  /const totalCards = state\.activeIdioms\?\.length \|\| state\.activeOWS\?\.length \|\| state\.activeSynonyms\?\.length \|\| 0;/,
  `const totalCards = flashcardStore.idioms.length || flashcardStore.ows.length || flashcardStore.synonyms.length || 0;`
);

code = code.replace(
  /const modeText = state\.status\.includes\('ows'\) \? 'One Word Substitutions' : state\.status\.includes\('synonym'\) \? 'Synonyms & Antonyms' : 'Idioms & Phrases';/,
  `const modeText = flashcardStore.type === 'ows' ? 'One Word Substitutions' : flashcardStore.type === 'synonyms' ? 'Synonyms & Antonyms' : 'Idioms & Phrases';`
);

code = code.replace(
  /const filters = state\.filters \|\| \{\};/,
  `const filters = flashcardStore.filters || {};`
);

code = code.replace(
  /const currentItemIndex = state\.currentQuestionIndex;/,
  `const currentItemIndex = flashcardStore.currentIndex;`
);

fs.writeFileSync(file, code);
