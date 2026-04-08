const fs = require('fs');

// 1. Update QuizMode Type
let storeTypes = fs.readFileSync('src/features/quiz/types/store.ts', 'utf8');
storeTypes = storeTypes.replace(
  `export type QuizMode = 'learning' | 'mock';`,
  `export type QuizMode = 'learning' | 'mock' | 'god';`
);
fs.writeFileSync('src/features/quiz/types/store.ts', storeTypes);

// 2. Update QuizSessionStore default global time calc
let storeHooks = fs.readFileSync('src/features/quiz/stores/useQuizSessionStore.ts', 'utf8');
storeHooks = storeHooks.replace(
  `    const globalTime = mode === 'mock'`,
  `    const globalTime = (mode === 'mock' || mode === 'god')`
);
storeHooks = storeHooks.replace(
  `    const globalTime = state.mode === 'mock'`,
  `    const globalTime = (state.mode === 'mock' || state.mode === 'god')`
);
fs.writeFileSync('src/features/quiz/stores/useQuizSessionStore.ts', storeHooks);

// 3. Update Reducer default global time calc
let reducer = fs.readFileSync('src/features/quiz/stores/quizReducer.ts', 'utf8');
reducer = reducer.replace(
  `      const globalTime = mode === 'mock'`,
  `      const globalTime = (mode === 'mock' || mode === 'god')`
);
reducer = reducer.replace(
  `      const globalTime = state.mode === 'mock'`,
  `      const globalTime = (state.mode === 'mock' || state.mode === 'god')`
);
fs.writeFileSync('src/features/quiz/stores/quizReducer.ts', reducer);
