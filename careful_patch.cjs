const fs = require('fs');

// 1. types/index.ts
let types = fs.readFileSync('src/features/quiz/types/index.ts', 'utf8');
const synonymTypes = `

export interface Synonym {
  text: string;
  meaning?: string;
  hindiMeaning?: string;
  pos?: string;
  cluster_id: string;
}

export interface Antonym {
  text: string;
  meaning?: string;
  hindiMeaning?: string;
  pos?: string;
}

export interface SynonymWord {
  id: string;
  word: string;
  pos: string;
  repetition_raw: string;
  importance_score: number;
  lifetime_frequency: number;
  recent_trend: number;
  meaning?: string;
  hindiMeaning?: string;
  theme: string;
  cluster_id: string;
  confusable_with: string[];
  synonyms: Synonym[];
  antonyms: Antonym[];
}
`;
types = types + synonymTypes;

types = types.replace(
  "export type QuizStatus = 'intro' | 'home' | 'config' | 'quiz' | 'result' | 'english-home' | 'vocab-home' | 'idioms-config' | 'ows-config' | 'flashcards' | 'ows-flashcards' | 'flashcards-complete' | 'tools' | 'flashcard-maker' | 'bilingual-pdf-maker' | 'quiz-pdf-ppt-generator';",
  "export type QuizStatus = 'intro' | 'home' | 'config' | 'quiz' | 'result' | 'english-home' | 'vocab-home' | 'idioms-config' | 'ows-config' | 'flashcards' | 'ows-flashcards' | 'synonym-flashcards' | 'flashcards-complete' | 'tools' | 'flashcard-maker' | 'bilingual-pdf-maker' | 'quiz-pdf-ppt-generator';"
);

types = types.replace(
  "  activeIdioms?: Idiom[];",
  "  activeIdioms?: Idiom[];\n  activeSynonyms?: SynonymWord[];"
);

types = types.replace(
  "| { type: 'START_OWS_FLASHCARDS'; payload: { data: OneWord[]; filters: InitialFilters } }",
  "| { type: 'START_OWS_FLASHCARDS'; payload: { data: OneWord[]; filters: InitialFilters } }\n  | { type: 'START_SYNONYM_FLASHCARDS'; payload: { data: SynonymWord[]; filters: InitialFilters } }"
);

types = types.replace(
  "| { type: 'ENTER_CONFIG'; payload?: 'quiz' | 'idioms' | 'ows' }",
  "| { type: 'ENTER_CONFIG'; payload?: 'quiz' | 'idioms' | 'ows' | 'synonyms' }"
);
fs.writeFileSync('src/features/quiz/types/index.ts', types);

// 2. quizReducer.ts
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
                status: 'synonym-flashcards',
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

// 3. useQuiz.ts
let useQuiz = fs.readFileSync('src/features/quiz/hooks/useQuiz.ts', 'utf8');
useQuiz = useQuiz.replace(
  "import { Question, InitialFilters, QuizMode, Idiom, OneWord, QuizState, QuizHistoryRecord, SubjectStats } from '../types';",
  "import { Question, InitialFilters, QuizMode, Idiom, OneWord, SynonymWord, QuizState, QuizHistoryRecord, SubjectStats } from '../types';"
);

useQuiz = useQuiz.replace(
  "const enterOWSConfig = useCallback(() => {\n    dispatch({ type: 'ENTER_CONFIG', payload: 'ows' });\n  }, []);",
  "const enterOWSConfig = useCallback(() => {\n    dispatch({ type: 'ENTER_CONFIG', payload: 'ows' });\n  }, []);\n\n  const enterSynonymsConfig = useCallback(() => {\n    dispatch({ type: 'ENTER_CONFIG', payload: 'synonyms' });\n  }, []);"
);

useQuiz = useQuiz.replace(
  "const startOWSFlashcards = useCallback((data: OneWord[], filters: InitialFilters) => {\n    dispatch({ type: 'START_OWS_FLASHCARDS', payload: { data, filters } });\n  }, []);",
  "const startOWSFlashcards = useCallback((data: OneWord[], filters: InitialFilters) => {\n    dispatch({ type: 'START_OWS_FLASHCARDS', payload: { data, filters } });\n  }, []);\n\n  const startSynonymFlashcards = useCallback((data: SynonymWord[], filters: InitialFilters) => {\n    dispatch({ type: 'START_SYNONYM_FLASHCARDS', payload: { data, filters } });\n  }, []);"
);

useQuiz = useQuiz.replace(
  "enterOWSConfig,",
  "enterOWSConfig,\n    enterSynonymsConfig,"
);

useQuiz = useQuiz.replace(
  "startOWSFlashcards,",
  "startOWSFlashcards,\n    startSynonymFlashcards,"
);
fs.writeFileSync('src/features/quiz/hooks/useQuiz.ts', useQuiz);

// 4. VocabQuizHome.tsx
let vocab = fs.readFileSync('src/features/quiz/components/VocabQuizHome.tsx', 'utf8');
vocab = vocab.replace(
  "import { Book, Target, Quote, ChevronRight, Compass } from 'lucide-react';",
  "import { Book, Target, Quote, ChevronRight, Compass, BookOpen } from 'lucide-react';"
);

vocab = vocab.replace(
  "interface VocabQuizHomeProps {\n  onBack: () => void;\n  onIdiomsClick: () => void;\n  onOWSClick: () => void;\n}",
  "interface VocabQuizHomeProps {\n  onBack: () => void;\n  onIdiomsClick: () => void;\n  onOWSClick: () => void;\n  onSynonymsClick?: () => void;\n}"
);

vocab = vocab.replace(
  "export const VocabQuizHome: React.FC<VocabQuizHomeProps> = ({ onBack, onIdiomsClick, onOWSClick }) => {",
  "export const VocabQuizHome: React.FC<VocabQuizHomeProps> = ({ onBack, onIdiomsClick, onOWSClick, onSynonymsClick }) => {"
);

vocab = vocab.replace(
  "    }\n  ];",
  "    },\n    {\n      id: 'synonyms',\n      title: \"Synonyms & Antonyms Master\",\n      description: \"Master similar and opposite meaning words through grouped clusters.\",\n      icon: <BookOpen className=\\\"w-6 h-6 text-emerald-600\\\" />,\n      bgClass: \"bg-emerald-50\",\n      borderClass: \"hover:border-emerald-300\",\n      iconBg: \"bg-emerald-100\",\n      action: onSynonymsClick,\n      badgeText: \"New\"\n    }\n  ];"
);
fs.writeFileSync('src/features/quiz/components/VocabQuizHome.tsx', vocab);

// 5. AppRoutes.tsx
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
