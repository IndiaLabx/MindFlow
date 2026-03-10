const fs = require('fs');

// quizReducer patch
let reducer = fs.readFileSync('src/features/quiz/stores/quizReducer.ts', 'utf8');
const newCase = `case 'START_OWS_FLASHCARDS': {
            const data = (action as any).payload.data;
            const filters = (action as any).payload.filters;
            return {
                ...state,
                status: 'ows-flashcards',
                activeOWS: data,
                filters,
                currentQuestionIndex: 0,
                quizId: uuidv4()
            };
        }
        case 'START_SYNONYM_FLASHCARDS': {
            const data = (action as any).payload.data;
            const filters = (action as any).payload.filters;
            return {
                ...state,
                status: 'synonym-flashcards' as any,
                activeSynonyms: data,
                filters,
                currentQuestionIndex: 0,
                quizId: uuidv4()
            };
        }`;
reducer = reducer.replace(
  "case 'START_OWS_FLASHCARDS': {\n            const data = (action as any).payload.data;\n            const filters = (action as any).payload.filters;\n            return {\n                ...state,\n                status: 'ows-flashcards',\n                activeOWS: data,\n                filters,\n                currentQuestionIndex: 0,\n                quizId: uuidv4()\n            };\n        }",
  newCase
);
fs.writeFileSync('src/features/quiz/stores/quizReducer.ts', reducer);

// AppRoutes patch
let routes = fs.readFileSync('src/routes/AppRoutes.tsx', 'utf8');
routes = routes.replace(
  "const FlashcardSummary = lazy(() => import('../features/flashcards/components/FlashcardSummary').then(m => ({ default: m.FlashcardSummary })));",
  "const FlashcardSummary = lazy(() => import('../features/flashcards/components/FlashcardSummary').then(m => ({ default: m.FlashcardSummary })));\nconst SynonymsConfig = lazy(() => import('../features/synonyms/SynonymsConfig').then(m => ({ default: m.SynonymsConfig })));\nconst SynonymFlashcardSession = lazy(() => import('../features/synonyms/components/SynonymFlashcardSession').then(m => ({ default: m.SynonymFlashcardSession })));\nconst SynonymClusterList = lazy(() => import('../features/synonyms/components/SynonymClusterList').then(m => ({ default: m.SynonymClusterList })));\nconst SynonymQuizSession = lazy(() => import('../features/synonyms/components/SynonymQuizSession').then(m => ({ default: m.SynonymQuizSession })));"
);

routes = routes.replace(
  "enterOWSConfig,\n        enterProfile,",
  "enterOWSConfig,\n        enterSynonymsConfig,\n        startSynonymFlashcards,\n        enterProfile,"
);

routes = routes.replace(
  "onOWSClick={() => { enterOWSConfig(); navTo('/ows/config'); }}",
  "onOWSClick={() => { enterOWSConfig(); navTo('/ows/config'); }}\n                            onSynonymsClick={() => { enterSynonymsConfig(); navTo('/synonyms/config'); }}"
);

routes = routes.replace(
  "<Route path=\"/ows/config\"",
  `<Route path="/synonyms/config" element={
                        <SynonymsConfig
                            onBack={() => { enterVocabHome(); navTo('/vocab'); }}
                            onStart={(data: any, filters: any) => {
                                startSynonymFlashcards(data, filters);
                                navTo('/synonyms/session');
                            }}
                        />
                    } />
                    <Route path="/synonyms/list" element={<SynonymClusterList onExit={() => navTo('/synonyms/config')} />} />
                    <Route path="/synonyms/quiz" element={<SynonymQuizSession onExit={() => navTo('/synonyms/config')} />} />

                    <Route path="/ows/config"`
);

routes = routes.replace(
  "<Route path=\"/ows/session\"",
  `<Route path="/synonyms/session" element={
                    <SynonymFlashcardSession
                        data={state.activeSynonyms || []}
                        currentIndex={state.currentQuestionIndex}
                        onNext={nextQuestion}
                        onPrev={prevQuestion}
                        onExit={navHome}
                        onFinish={() => navTo('/flashcards/summary')}
                        filters={state.filters || {} as any}
                        onJump={jumpToQuestion}
                    />
                } />

                <Route path="/ows/session"`
);
fs.writeFileSync('src/routes/AppRoutes.tsx', routes);
