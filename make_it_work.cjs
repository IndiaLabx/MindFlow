const fs = require('fs');

// We're just going to rewrite the files that are broken with the correct, simple code.
// The constant string replacements are failing because of edge cases and formatting differences.

// 1. types/index.ts
let types = fs.readFileSync('src/features/quiz/types/index.ts', 'utf8');
if(!types.includes('activeSynonyms')) {
  types = types.replace(
    "activeIdioms?: Idiom[];",
    "activeIdioms?: Idiom[];\n  activeSynonyms?: any[];"
  );
}

if(!types.includes("'START_SYNONYM_FLASHCARDS'")) {
    types = types.replace(
      "| { type: 'START_OWS_FLASHCARDS'; payload: { data: OneWord[]; filters: InitialFilters } }",
      "| { type: 'START_OWS_FLASHCARDS'; payload: { data: OneWord[]; filters: InitialFilters } }\n  | { type: 'START_SYNONYM_FLASHCARDS'; payload: { data: any[]; filters: InitialFilters } }"
    );
}

fs.writeFileSync('src/features/quiz/types/index.ts', types);

// 2. VocabQuizHome.tsx
const vocabContent = `import React from 'react';
import { Book, Target, Quote, ChevronRight, Compass, BookOpen } from 'lucide-react';
import { VocabularyCard } from './Dashboard';

interface VocabQuizHomeProps {
  onBack: () => void;
  onIdiomsClick: () => void;
  onOWSClick: () => void;
  onSynonymsClick?: () => void;
}

export const VocabQuizHome: React.FC<VocabQuizHomeProps> = ({ onBack, onIdiomsClick, onOWSClick, onSynonymsClick }) => {
  const items = [
    {
      id: 'idioms',
      title: "Idioms & Phrases",
      description: "Master common expressions and their hidden meanings.",
      icon: <Quote className="w-6 h-6 text-amber-600" />,
      bgClass: "bg-amber-50",
      borderClass: "hover:border-amber-300",
      iconBg: "bg-amber-100",
      action: onIdiomsClick
    },
    {
      id: 'ows',
      title: "One Word Substitution",
      description: "Learn single words that replace entire phrases.",
      icon: <Target className="w-6 h-6 text-purple-600" />,
      bgClass: "bg-purple-50",
      borderClass: "hover:border-purple-300",
      iconBg: "bg-purple-100",
      action: onOWSClick
    },
    {
      id: 'synonyms',
      title: "Synonyms & Antonyms Master",
      description: "Master similar and opposite meaning words through grouped clusters.",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      bgClass: "bg-emerald-50",
      borderClass: "hover:border-emerald-300",
      iconBg: "bg-emerald-100",
      action: onSynonymsClick,
      badgeText: "New"
    }
  ];

  return (
    <main className="flex-1 flex flex-col p-4 pb-24 md:pb-8 animate-fade-in max-w-2xl mx-auto w-full">
      <header className="mb-6">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center mb-4 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
          Back to English Zone
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center">
            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Vocabulary Master
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Expand your word power</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {items.map((item) => (
          <VocabularyCard
            key={item.id}
            title={item.title}
            description={item.description}
            icon={item.icon}
            colorClass={\`\${item.bgClass} dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 \${item.borderClass}\`}
            onClick={item.action || (() => {})}
            badgeText={item.badgeText}
          />
        ))}
      </div>
    </main>
  );
};`;
fs.writeFileSync('src/features/quiz/components/VocabQuizHome.tsx', vocabContent);

// 3. useQuiz.ts hook return value fix
let useQuiz = fs.readFileSync('src/features/quiz/hooks/useQuiz.ts', 'utf8');
if (!useQuiz.includes("enterSynonymsConfig,")) {
  useQuiz = useQuiz.replace("enterOWSConfig,", "enterOWSConfig,\n    enterSynonymsConfig,");
}
fs.writeFileSync('src/features/quiz/hooks/useQuiz.ts', useQuiz);
