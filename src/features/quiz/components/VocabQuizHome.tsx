import React from 'react';
import { Book, Target, Quote, ChevronRight, Compass, BookOpen } from 'lucide-react';

interface VocabQuizHomeProps {
  onBack: () => void;
  onIdiomsClick: () => void;
  onOWSClick: () => void;
  onSynonymsClick?: () => void;
}


const VocabularyCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick: () => void;
  badgeText?: string;
}> = ({ title, description, icon, colorClass, onClick, badgeText }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-200 shadow-sm active:translate-y-1 active:border-b ${colorClass}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-4 inline-block rounded-xl bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 p-3 shadow-sm group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-end">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 dark:bg-gray-800/60 shadow-sm transition-transform group-hover:scale-110">
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
            </div>
            {badgeText && (
               <span className="mt-4 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                   {badgeText}
               </span>
            )}
        </div>
      </div>
    </button>
  );
};

export const VocabQuizHome: React.FC<VocabQuizHomeProps> = ({ onBack, onIdiomsClick, onOWSClick, onSynonymsClick }) => {
  const items = [
    {
      id: 'idioms',
      title: "Idioms & Phrases",
      description: "Master common expressions and their hidden meanings.",
      icon: <Quote className="w-6 h-6 text-amber-600" />,
      bgClass: "bg-amber-50 dark:bg-amber-950/30",
      borderClass: "border-amber-100 dark:border-amber-900/40 border-b-4 border-b-amber-200 dark:border-b-amber-700 hover:border-amber-300 dark:hover:border-amber-500",
      iconBg: "bg-amber-100",
      action: onIdiomsClick
    },
    {
      id: 'ows',
      title: "One Word Substitution",
      description: "Learn single words that replace entire phrases.",
      icon: <Target className="w-6 h-6 text-purple-600" />,
      bgClass: "bg-purple-50 dark:bg-purple-950/30",
      borderClass: "border-purple-100 dark:border-purple-900/40 border-b-4 border-b-purple-200 dark:border-b-purple-700 hover:border-purple-300 dark:hover:border-purple-500",
      iconBg: "bg-purple-100",
      action: onOWSClick
    },
    {
      id: 'synonyms',
      title: "Synonyms & Antonyms Master",
      description: "Master similar and opposite meaning words through grouped clusters.",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
      borderClass: "border-emerald-100 dark:border-emerald-900/40 border-b-4 border-b-emerald-200 dark:border-b-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-500",
      iconBg: "bg-emerald-100",
      action: onSynonymsClick,
      badgeText: "New"
    },

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
            colorClass={`${item.bgClass} border ${item.borderClass}`}
            onClick={item.action || (() => {})}
            badgeText={item.badgeText}
          />
        ))}
      </div>
    </main>
  );
};