const fs = require('fs');

let fileContent = fs.readFileSync('src/features/tools/text-exporter/TextExporter.tsx', 'utf8');

// The main wrapper is:
// <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-safe transition-colors duration-300 flex flex-col relative overflow-hidden">
// The second container is:
// <div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 animate-fade-in">

// Replace to ensure `h-full` stretching
fileContent = fileContent.replace(
    /<div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-safe transition-colors duration-300 flex flex-col relative overflow-hidden">/,
    '<div className="h-screen bg-slate-50 dark:bg-slate-900 pt-safe transition-colors duration-300 flex flex-col relative overflow-hidden">'
);

// We need to move the footer outside the main flex container so it can be fixed.
// First, let's fix the height issue of the container.
fileContent = fileContent.replace(
    /<div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 animate-fade-in">/,
    '<div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-2 animate-fade-in pb-24">'
);

fs.writeFileSync('src/features/tools/text-exporter/TextExporter.tsx', fileContent);
