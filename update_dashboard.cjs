const fs = require('fs');

const path = './src/features/quiz/components/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// The classes to replace the old ones with
const baseCardClasses = "p-6 rounded-2xl cursor-pointer group relative z-20 transition-all duration-200 shadow-sm active:translate-y-1 active:border-b flex items-center justify-between";
const baseIconContainerClasses = "w-12 h-12 bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0";
const baseTextContainerClasses = "flex-1 pr-4";

const cardsData = [
    {
        id: "Card 1 - Custom Quiz",
        bgColorClass: "bg-indigo-50 dark:bg-indigo-950/30",
        borderClasses: "border border-indigo-100 dark:border-indigo-900/40 border-b-4 border-b-indigo-200 dark:border-b-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-500",
        iconContainerReplacement: `className="${baseIconContainerClasses}"`,
        iconClassesReplacement: 'className="w-6 h-6 text-indigo-600 dark:text-indigo-400"',
        chevronClass: "text-indigo-400 dark:text-indigo-500",
        oldRegex: /\{\/\* Card 1 - Custom Quiz \*\/\}[\s\S]*?(?=<!--|\{\/\* Card 2)/,
        title: "Create Quiz",
        desc: "Filter by subject, topic, and difficulty.",
        iconComponent: "ListChecks",
        onClick: "onStartQuiz"
    },
    {
        id: "Card 2 - Created Quizzes",
        bgColorClass: "bg-emerald-50 dark:bg-emerald-950/30",
        borderClasses: "border border-emerald-100 dark:border-emerald-900/40 border-b-4 border-b-emerald-200 dark:border-b-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-500",
        iconContainerReplacement: `className="${baseIconContainerClasses}"`,
        iconClassesReplacement: 'className="w-6 h-6 text-emerald-600 dark:text-emerald-400"',
        chevronClass: "text-emerald-400 dark:text-emerald-500",
        title: "Created Quizzes",
        desc: "Resume paused quizzes or view completed ones.",
        iconComponent: "Save",
        onClick: "onSavedQuizzes"
    },
    {
        id: "Card 3 - English",
        bgColorClass: "bg-rose-50 dark:bg-rose-950/30",
        borderClasses: "border border-rose-100 dark:border-rose-900/40 border-b-4 border-b-rose-200 dark:border-b-rose-700 hover:border-rose-300 dark:hover:border-rose-500",
        iconContainerReplacement: `className="${baseIconContainerClasses}"`,
        iconClassesReplacement: 'className="w-6 h-6 text-rose-600 dark:text-rose-400"',
        chevronClass: "text-rose-400 dark:text-rose-500",
        title: "English Zone",
        desc: "Vocab, Grammar & Mock Tests.",
        iconComponent: "Languages",
        onClick: "onEnglish"
    },
    {
        id: "Card 4 - Tools",
        bgColorClass: "bg-amber-50 dark:bg-amber-950/30",
        borderClasses: "border border-amber-100 dark:border-amber-900/40 border-b-4 border-b-amber-200 dark:border-b-amber-700 hover:border-amber-300 dark:hover:border-amber-500",
        iconContainerReplacement: `className="${baseIconContainerClasses}"`,
        iconClassesReplacement: 'className="w-6 h-6 text-amber-600 dark:text-amber-400"',
        chevronClass: "text-amber-400 dark:text-amber-500",
        title: "Tools",
        desc: "Flashcard Maker & Utilities.",
        iconComponent: "Wrench",
        onClick: "() => navigate('/tools')"
    },
    {
        id: "Card 5 - Analytics",
        bgColorClass: "bg-blue-50 dark:bg-blue-950/30",
        borderClasses: "border border-blue-100 dark:border-blue-900/40 border-b-4 border-b-blue-200 dark:border-b-blue-700 hover:border-blue-300 dark:hover:border-blue-500",
        iconContainerReplacement: `className="${baseIconContainerClasses}"`,
        iconClassesReplacement: 'className="w-6 h-6 text-blue-600 dark:text-blue-400"',
        chevronClass: "text-blue-400 dark:text-blue-500",
        title: "Analytics",
        desc: "Detailed report cards & stats.",
        iconComponent: "BarChart2",
        onClick: "() => navigate('/quiz/analytics')"
    },
    {
        id: "Card 6 - Bookmarks",
        bgColorClass: "bg-violet-50 dark:bg-violet-950/30",
        borderClasses: "border border-violet-100 dark:border-violet-900/40 border-b-4 border-b-violet-200 dark:border-b-violet-700 hover:border-violet-300 dark:hover:border-violet-500",
        iconContainerReplacement: `className="${baseIconContainerClasses}"`,
        iconClassesReplacement: 'className="w-6 h-6 text-violet-600 dark:text-violet-400"',
        chevronClass: "text-violet-400 dark:text-violet-500",
        title: "Bookmarks",
        desc: "Review your saved questions.",
        iconComponent: "Star",
        onClick: "() => navigate('/quiz/bookmarks')",
        extraClasses: " sm:col-span-2 lg:col-span-1"
    }
];

let newCardsHTML = "";
for (let i = 0; i < cardsData.length; i++) {
    const card = cardsData[i];

    newCardsHTML += `
                    {/* ${card.id} */}
                    <div
                        onClick={${card.onClick}}
                        className="${card.bgColorClass} ${baseCardClasses} ${card.borderClasses}${card.extraClasses || ''}"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="${baseIconContainerClasses}">
                                <${card.iconComponent} className="${card.iconClassesReplacement.match(/className="(.*?)"/)[1]}" />
                            </div>
                            <div className="flex-1 pr-2">
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
const cardsGridRegex = /\{\/\* Cards Grid \*\/\}\s*<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">([\s\S]*?)<\!-- Footer Link -->|\{\/\* Footer Link \*\/\}/;

content = content.replace(cardsGridRegex, (match, p1) => {
    return `{/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
${newCardsHTML}
                </div>

                {/* Footer Link */}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log("Dashboard cards updated.");
