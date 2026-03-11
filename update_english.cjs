const fs = require('fs');

const path = './src/features/quiz/components/EnglishQuizHome.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace lucide imports
content = content.replace(
    /import { ArrowLeft, BookA, PenTool, FileText } from 'lucide-react';/,
    "import { ArrowLeft, BookA, PenTool, FileText, ChevronRight } from 'lucide-react';"
);

// The classes to replace the old ones with
const baseCardClasses = "p-6 rounded-2xl cursor-pointer group relative z-20 transition-all duration-200 shadow-sm active:translate-y-1 active:border-b flex items-center justify-between";
const baseIconContainerClasses = "w-12 h-12 bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0";
const baseTextContainerClasses = "flex-1 pr-2";

const cardsData = [
    {
        id: "Card 1: Vocab Quiz",
        bgColorClass: "bg-emerald-50 dark:bg-emerald-950/30",
        borderClasses: "border border-emerald-100 dark:border-emerald-900/40 border-b-4 border-b-emerald-200 dark:border-b-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-500",
        iconClassesReplacement: 'className="w-6 h-6 text-emerald-600 dark:text-emerald-400"',
        chevronClass: "text-emerald-400 dark:text-emerald-500",
        title: "Vocab Quiz",
        desc: "Idioms, One-word substitutions, Synonyms, and Antonyms.",
        iconComponent: "BookA",
        onClick: "onVocabClick"
    },
    {
        id: "Card 2: Grammar Quiz",
        bgColorClass: "bg-violet-50 dark:bg-violet-950/30",
        borderClasses: "border border-violet-100 dark:border-violet-900/40 border-b-4 border-b-violet-200 dark:border-b-violet-700 hover:border-violet-300 dark:hover:border-violet-500",
        iconClassesReplacement: 'className="w-6 h-6 text-violet-600 dark:text-violet-400"',
        chevronClass: "text-violet-400 dark:text-violet-500",
        title: "Grammar Quiz",
        desc: "Test your grammar skills with error detection and sentence improvement.",
        iconComponent: "PenTool",
        onClick: "undefined"
    },
    {
        id: "Card 3: Mock Test",
        bgColorClass: "bg-rose-50 dark:bg-rose-950/30",
        borderClasses: "border border-rose-100 dark:border-rose-900/40 border-b-4 border-b-rose-200 dark:border-b-rose-700 hover:border-rose-300 dark:hover:border-rose-500",
        iconClassesReplacement: 'className="w-6 h-6 text-rose-600 dark:text-rose-400"',
        chevronClass: "text-rose-400 dark:text-rose-500",
        title: "English Mock",
        desc: "Full length mock test with 25-30 questions. (Coming Soon)",
        iconComponent: "FileText",
        onClick: "undefined"
    }
];

let newCardsHTML = "";
for (let i = 0; i < cardsData.length; i++) {
    const card = cardsData[i];

    newCardsHTML += `
          {/* ${card.id} */}
          <div
            onClick={${card.onClick}}
            className="${card.bgColorClass} ${baseCardClasses} ${card.borderClasses}"
          >
            <div className="flex items-center gap-4 flex-1">
                <div className="${baseIconContainerClasses}">
                    <${card.iconComponent} className="${card.iconClassesReplacement.match(/className="(.*?)"/)[1]}" />
                </div>
                <div className="${baseTextContainerClasses}">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">${card.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        ${card.desc}
                    </p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 ${card.chevronClass} flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>`;
}

// Replace the old cards grid content
const cardsGridRegex = /\{\/\* Feature Cards Grid \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto px-4">([\s\S]*?)<\/div>\s*<\/div>/;

content = content.replace(cardsGridRegex, (match, p1) => {
    return `{/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto px-4">
${newCardsHTML}
        </div>
      </div>`;
});

// Clean up redundant dark classes
content = content.replace(/dark:text-white dark:text-white dark:text-slate-100/g, 'dark:text-white');
content = content.replace(/dark:text-gray-300 dark:text-gray-300 dark:text-slate-400/g, 'dark:text-gray-400');
content = content.replace(/dark:text-gray-400 dark:text-gray-400 dark:text-slate-400/g, 'dark:text-gray-400');

fs.writeFileSync(path, content, 'utf8');
console.log("EnglishQuizHome cards updated.");
