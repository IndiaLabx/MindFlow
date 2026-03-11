const fs = require('fs');

const path = './src/features/quiz/components/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace dark:text-white dark:text-white dark:text-slate-100 with dark:text-white
content = content.replace(/dark:text-white dark:text-white dark:text-slate-100/g, 'dark:text-white');

// Replace dark:text-gray-300 dark:text-gray-300 dark:text-slate-300 with dark:text-gray-300
content = content.replace(/dark:text-gray-300 dark:text-gray-300 dark:text-slate-300/g, 'dark:text-gray-300');

// Replace dark:text-gray-400 dark:text-gray-400 dark:text-slate-400 with dark:text-gray-400
content = content.replace(/dark:text-gray-400 dark:text-gray-400 dark:text-slate-400/g, 'dark:text-gray-400');

fs.writeFileSync(path, content, 'utf8');
console.log("Dashboard classes cleaned up.");
