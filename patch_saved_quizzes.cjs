const fs = require('fs');

const path = 'src/features/quiz/components/SavedQuizzes.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import Mic icon
content = content.replace(
    "import { Trash2, Play, Clock, BookOpen, Edit2, Check, X, Save, Home, PlusCircle, CheckCircle } from 'lucide-react';",
    "import { Trash2, Play, Clock, BookOpen, Edit2, Check, X, Save, Home, PlusCircle, CheckCircle, Mic } from 'lucide-react';"
);

// 2. Add button
const buttonsReplacement = `
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        {!isQuizFinished(quiz) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate('/quiz/live/' + quiz.id); }}
                                                className="flex items-center gap-1 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:bg-amber-900/40 rounded-lg transition-colors font-medium text-sm"
                                                title="Talk to Quiz Master"
                                            >
                                                <Mic className="w-4 h-4" />
                                                Talk
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleResume(quiz); }}
                                            className="flex items-center gap-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:bg-indigo-900/40 rounded-lg transition-colors font-medium text-sm"
                                            title={isQuizFinished(quiz) ? "View Results" : isQuizStarted(quiz) ? "Resume Quiz" : "Start Quiz"}
                                        >
                                            <Play className="w-4 h-4" />
                                            {isQuizFinished(quiz) ? "View Results" : isQuizStarted(quiz) ? "Resume" : "Start"}
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(quiz.id, e)}
                                            className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete Quiz"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
`;

content = content.replace(
    /\{\/\* Action Buttons \*\/\}.*?<div className="flex items-center gap-2">.*?<button[\s\S]*?onClick=\{\(e\) => handleResume\(quiz\)\}[\s\S]*?className="flex items-center gap-1 px-3 py-2 bg-indigo-50.*?<\/button>.*?<button[\s\S]*?onClick=\{\(e\) => handleDelete\(quiz\.id, e\)\}[\s\S]*?<\/button>.*?<\/div>/s,
    buttonsReplacement
);

fs.writeFileSync(path, content, 'utf8');
console.log('SavedQuizzes successfully patched.');
