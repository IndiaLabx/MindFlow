const fs = require('fs');

let fileContent = fs.readFileSync('src/features/tools/text-exporter/TextExporter.tsx', 'utf8');

// Move footer out
const footerRegex = /{\/\* Footer \/ Status Bar \*\/}[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<BackgroundDecorations \/>)/;

const match = fileContent.match(footerRegex);
if (match) {
    let footerStr = match[0];

    // Remove the footer from its current place
    fileContent = fileContent.replace(footerRegex, '');

    // Modify the footer to be fixed at the bottom
    footerStr = footerStr.replace(
        /<div className="bg-white\/80 dark:bg-slate-800\/80 backdrop-blur-lg border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">/,
        '<div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">'
    );

    // Insert the fixed footer right before BackgroundDecorations
    fileContent = fileContent.replace(
        /<BackgroundDecorations \/>/,
        footerStr + '\n            <BackgroundDecorations />'
    );
}

// Ensure the main card takes the rest of the height and allows scrolling internally if needed
// Or make the iframe take the full height.
fileContent = fileContent.replace(
    /<div className="flex-1 bg-white\/60 dark:bg-slate-800\/60 backdrop-blur-xl border border-white\/40 dark:border-white\/10 rounded-\[32px\] shadow-lg flex flex-col overflow-hidden relative">/,
    '<div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[32px] rounded-b-none shadow-lg flex flex-col overflow-hidden relative">'
);

fs.writeFileSync('src/features/tools/text-exporter/TextExporter.tsx', fileContent);
