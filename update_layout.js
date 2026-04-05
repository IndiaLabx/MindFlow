const fs = require('fs');

let fileContent = fs.readFileSync('src/features/tools/text-exporter/TextExporter.tsx', 'utf8');

// The main wrapper is:
// <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-safe transition-colors duration-300 flex flex-col relative overflow-hidden">
// We want to ensure it is height 100vh and the main container grows.

fileContent = fileContent.replace(
    /<div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 animate-fade-in">/,
    '<div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 animate-fade-in h-[calc(100vh-100px)]">'
);

fs.writeFileSync('src/features/tools/text-exporter/TextExporter.tsx', fileContent);
