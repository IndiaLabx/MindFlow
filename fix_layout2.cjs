const fs = require('fs');

let fileContent = fs.readFileSync('src/features/tools/text-exporter/TextExporter.tsx', 'utf8');

// I see my previous regex matching the footer actually didn't work because it replaced the footer with empty space but failed to insert the fixed bottom footer since I used BackgroundDecorations which doesn't exist in this file.

// Wait, let's check the bottom of the file in the output. Ah, my previous `fix_layout.cjs` actually inserted the old footer back into the file but inside the main card because the regex didn't work as expected or `BackgroundDecorations` wasn't there.
// Let's manually reconstruct the component return statement.

fileContent = fileContent.replace(
    /\{\/\* Footer \/ Status Bar \*\/\}(.|\n)*?<\/div>\n                <\/div>\n            <\/div>\n        <\/div>/g,
    `
                </div>
            </div>

            {/* Footer / Status Bar - Fixed at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-900 px-4 py-2 rounded-xl w-full sm:w-auto justify-center">
                    <span>{stats.words.toLocaleString()} Words</span>
                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></div>
                    <span>{stats.characters.toLocaleString()} Chars</span>
                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></div>
                    <span>~{stats.readingTime} min read</span>
                </div>

                {/* Export Actions */}
                <div className="flex items-center justify-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2 shrink-0">Export as:</span>
                    <button
                        onClick={() => handleDownload('txt')}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors active:scale-95 shrink-0"
                    >
                        <FileText className="w-4 h-4" /> .TXT
                    </button>
                    <button
                        onClick={() => handleDownload('md')}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold transition-colors active:scale-95 shrink-0"
                    >
                        <FileCode className="w-4 h-4" /> .MD
                    </button>
                    <button
                        onClick={() => handleDownload('html')}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-colors shadow-md shadow-rose-500/20 active:scale-95 shrink-0"
                    >
                        <Download className="w-4 h-4" /> HTML
                    </button>
                </div>
            </div>
        </div>
    `
);

fs.writeFileSync('src/features/tools/text-exporter/TextExporter.tsx', fileContent);
