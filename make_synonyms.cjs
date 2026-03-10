const fs = require('fs');

fs.mkdirSync('src/features/synonyms/components', { recursive: true });
fs.mkdirSync('src/features/synonyms/hooks', { recursive: true });
fs.mkdirSync('src/features/synonyms/data', { recursive: true });

fs.writeFileSync('src/features/synonyms/SynonymsConfig.tsx', `import React from 'react';\nexport const SynonymsConfig: React.FC<any> = ({ onBack, onStart }) => {\n    return (\n        <div className="p-4">\n            <button onClick={onBack} className="mb-4 text-blue-500">Back</button>\n            <h1 className="text-2xl font-bold mb-4">Synonyms & Antonyms Config</h1>\n            <button onClick={() => onStart([], {})} className="bg-blue-600 text-white px-4 py-2 rounded">Start</button>\n        </div>\n    );\n};\n`);

fs.writeFileSync('src/features/synonyms/components/SynonymFlashcardSession.tsx', `import React from 'react';\nexport const SynonymFlashcardSession: React.FC<any> = ({ onExit }) => {\n    return (\n        <div className="p-4 h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">\n            <h1 className="text-2xl font-bold mb-4">Synonym Flashcards</h1>\n            <button onClick={onExit} className="bg-red-500 text-white px-4 py-2 rounded">Exit</button>\n        </div>\n    );\n};\n`);

fs.writeFileSync('src/features/synonyms/components/SynonymClusterList.tsx', `import React from 'react';\nexport const SynonymClusterList: React.FC<any> = ({ onExit }) => {\n    return (\n        <div className="p-4">\n            <h1 className="text-2xl font-bold mb-4">Synonym Clusters</h1>\n            <button onClick={onExit} className="bg-red-500 text-white px-4 py-2 rounded">Exit</button>\n        </div>\n    );\n};\n`);

fs.writeFileSync('src/features/synonyms/components/SynonymQuizSession.tsx', `import React from 'react';\nexport const SynonymQuizSession: React.FC<any> = ({ onExit }) => {\n    return (\n        <div className="p-4">\n            <h1 className="text-2xl font-bold mb-4">Synonym Quiz Session</h1>\n            <button onClick={onExit} className="bg-red-500 text-white px-4 py-2 rounded">Exit</button>\n        </div>\n    );\n};\n`);

// Types patch without regex errors
let types = fs.readFileSync('src/features/quiz/types/index.ts', 'utf8');

const synonymTypes = `

export interface Synonym { text: string; meaning?: string; hindiMeaning?: string; pos?: string; cluster_id: string; }
export interface Antonym { text: string; meaning?: string; hindiMeaning?: string; pos?: string; }
export interface SynonymWord { id: string; word: string; pos: string; repetition_raw: string; importance_score: number; lifetime_frequency: number; recent_trend: number; meaning?: string; hindiMeaning?: string; theme: string; cluster_id: string; confusable_with: string[]; synonyms: Synonym[]; antonyms: Antonym[]; }
`;
types += synonymTypes;
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

// useQuiz patch
let useQuiz = fs.readFileSync('src/features/quiz/hooks/useQuiz.ts', 'utf8');
useQuiz = useQuiz.replace(
  "import { Question, InitialFilters, QuizMode, Idiom, OneWord, QuizState, QuizHistoryRecord, SubjectStats } from '../types';",
  "import { Question, InitialFilters, QuizMode, Idiom, OneWord, SynonymWord, QuizState, QuizHistoryRecord, SubjectStats } from '../types';"
);
useQuiz = useQuiz.replace(
  "enterOWSConfig,",
  "enterOWSConfig,\n    enterSynonymsConfig: useCallback(() => dispatch({ type: 'ENTER_CONFIG', payload: 'synonyms' }), []),"
);
useQuiz = useQuiz.replace(
  "startOWSFlashcards,",
  "startOWSFlashcards,\n    startSynonymFlashcards: useCallback((data: SynonymWord[], filters: InitialFilters) => dispatch({ type: 'START_SYNONYM_FLASHCARDS', payload: { data, filters } }), []),"
);
fs.writeFileSync('src/features/quiz/hooks/useQuiz.ts', useQuiz);

// VocabQuizHome patch
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

// Replace icon quote
vocab = fs.readFileSync('src/features/quiz/components/VocabQuizHome.tsx', 'utf8');
vocab = vocab.replace(
  "icon: <BookOpen className=\\\"w-6 h-6 text-emerald-600\\\" />",
  "icon: <BookOpen className=\"w-6 h-6 text-emerald-600\" />"
);
fs.writeFileSync('src/features/quiz/components/VocabQuizHome.tsx', vocab);
