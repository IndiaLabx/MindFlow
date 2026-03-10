const fs = require('fs');

// Patch AppRoutes directly safely
let routes = fs.readFileSync('src/routes/AppRoutes.tsx', 'utf8');

// Re-add synonyms route
if (!routes.includes('SynonymFlashcardSession')) {
  routes = routes.replace(
    "const FlashcardSummary = lazy(() => import('../features/flashcards/components/FlashcardSummary').then(m => ({ default: m.FlashcardSummary })));",
    "const FlashcardSummary = lazy(() => import('../features/flashcards/components/FlashcardSummary').then(m => ({ default: m.FlashcardSummary })));\nconst SynonymsConfig = lazy(() => import('../features/synonyms/SynonymsConfig').then(m => ({ default: m.SynonymsConfig })));\nconst SynonymFlashcardSession = lazy(() => import('../features/synonyms/components/SynonymFlashcardSession').then(m => ({ default: m.SynonymFlashcardSession })));\nconst SynonymClusterList = lazy(() => import('../features/synonyms/components/SynonymClusterList').then(m => ({ default: m.SynonymClusterList })));\nconst SynonymQuizSession = lazy(() => import('../features/synonyms/components/SynonymQuizSession').then(m => ({ default: m.SynonymQuizSession })));"
  );
}

// Add state destructuring
if (!routes.includes('startSynonymFlashcards')) {
  routes = routes.replace(
    "enterOWSConfig,\n        enterProfile,",
    "enterOWSConfig,\n        enterSynonymsConfig: () => dispatch({ type: 'ENTER_CONFIG', payload: 'synonyms' } as any),\n        startSynonymFlashcards: (data: any, filters: any) => dispatch({ type: 'START_SYNONYM_FLASHCARDS', payload: { data, filters } } as any),\n        enterProfile,"
  );
  // Need dispatch available
  if (!routes.includes('const dispatch = useQuizContext().dispatch;')) {
      routes = routes.replace(
        "const navigate = useNavigate();",
        "const navigate = useNavigate();\n    const dispatch = useQuizContext().dispatch;"
      );
  }
}

// Re-add to VocabQuizHome click
if (!routes.includes("navTo('/synonyms/config')")) {
  routes = routes.replace(
    "onOWSClick={() => { enterOWSConfig(); navTo('/ows/config'); }}",
    "onOWSClick={() => { enterOWSConfig(); navTo('/ows/config'); }}\n                            onSynonymsClick={() => navTo('/synonyms/config')}"
  );
}

// Add actual routes
if (!routes.includes('path="/synonyms/config"')) {
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
}

if (!routes.includes('path="/synonyms/session"')) {
  routes = routes.replace(
    "<Route path=\"/ows/session\"",
    `<Route path="/synonyms/session" element={
                    <SynonymFlashcardSession
                        data={(state as any).activeSynonyms || []}
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
}

fs.writeFileSync('src/routes/AppRoutes.tsx', routes);

// Make sure useQuiz exports dispatch
let useQuiz = fs.readFileSync('src/features/quiz/hooks/useQuiz.ts', 'utf8');
if (!useQuiz.includes("dispatch,")) {
    useQuiz = useQuiz.replace(
      "return {\n    state,",
      "return {\n    state,\n    dispatch,"
    );
    fs.writeFileSync('src/features/quiz/hooks/useQuiz.ts', useQuiz);
}

// Patch VocabQuizHome locally
let vocab = fs.readFileSync('src/features/quiz/components/VocabQuizHome.tsx', 'utf8');
vocab = vocab.replace(
  "interface VocabQuizHomeProps {\n  onBack: () => void;\n  onIdiomsClick: () => void;\n  onOWSClick: () => void;\n}",
  "interface VocabQuizHomeProps {\n  onBack: () => void;\n  onIdiomsClick: () => void;\n  onOWSClick: () => void;\n  onSynonymsClick?: () => void;\n}"
);
vocab = vocab.replace(
  "export const VocabQuizHome: React.FC<VocabQuizHomeProps> = ({ onBack, onIdiomsClick, onOWSClick }) => {",
  "export const VocabQuizHome: React.FC<VocabQuizHomeProps> = ({ onBack, onIdiomsClick, onOWSClick, onSynonymsClick }) => {"
);
vocab = vocab.replace(
  "import { Book, Target, Quote, ChevronRight, Compass } from 'lucide-react';",
  "import { Book, Target, Quote, ChevronRight, Compass, BookOpen } from 'lucide-react';"
);

if (!vocab.includes("id: 'synonyms'")) {
    vocab = vocab.replace(
      "    }\n  ];",
      "    },\n    {\n      id: 'synonyms',\n      title: \"Synonyms & Antonyms Master\",\n      description: \"Master similar and opposite meaning words through grouped clusters.\",\n      icon: <BookOpen className=\\\"w-6 h-6 text-emerald-600\\\" />,\n      bgClass: \"bg-emerald-50\",\n      borderClass: \"hover:border-emerald-300\",\n      iconBg: \"bg-emerald-100\",\n      action: onSynonymsClick,\n      badgeText: \"New\"\n    }\n  ];"
    );
}

fs.writeFileSync('src/features/quiz/components/VocabQuizHome.tsx', vocab);

// Just patch the type locally without re-defining everything
let types = fs.readFileSync('src/features/quiz/types/index.ts', 'utf8');
if (!types.includes("activeSynonyms?: any[];")) {
  types = types.replace(
    "activeIdioms?: Idiom[];",
    "activeIdioms?: Idiom[];\n  activeSynonyms?: any[];"
  );
  fs.writeFileSync('src/features/quiz/types/index.ts', types);
}

// Add reducer case directly
let reducer = fs.readFileSync('src/features/quiz/stores/quizReducer.ts', 'utf8');
if (!reducer.includes("START_SYNONYM_FLASHCARDS")) {
    reducer = reducer.replace(
      "case 'START_OWS_FLASHCARDS': {\n            const data = (action as any).payload.data;\n            const filters = (action as any).payload.filters;\n            return {\n                ...state,\n                status: 'ows-flashcards',\n                activeOWS: data,\n                filters,\n                currentQuestionIndex: 0,\n                quizId: uuidv4()\n            };\n        }",
      "case 'START_OWS_FLASHCARDS': {\n            const data = (action as any).payload.data;\n            const filters = (action as any).payload.filters;\n            return {\n                ...state,\n                status: 'ows-flashcards',\n                activeOWS: data,\n                filters,\n                currentQuestionIndex: 0,\n                quizId: uuidv4()\n            };\n        }\n        case 'START_SYNONYM_FLASHCARDS': {\n            const data = (action as any).payload.data;\n            const filters = (action as any).payload.filters;\n            return {\n                ...state,\n                status: 'synonym-flashcards' as any,\n                activeSynonyms: data,\n                filters,\n                currentQuestionIndex: 0,\n                quizId: uuidv4()\n            };\n        }"
    );
    fs.writeFileSync('src/features/quiz/stores/quizReducer.ts', reducer);
}
