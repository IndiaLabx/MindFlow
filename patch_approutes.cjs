const fs = require('fs');
const content = fs.readFileSync('src/routes/AppRoutes.tsx', 'utf8');

let updated = content.replace(
  `import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';`,
  `import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';`
);

updated = updated.replace(
  `    const flashcardStore = useFlashcardStore();`,
  `    const flashcardStore = useFlashcardStore();
    const location = useLocation();`
);

updated = updated.replace(
  `        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SynapticLoader size="xl" /></div>}>`,
  `        <Suspense fallback={
            location.pathname === '/'
                ? <div className="min-h-screen w-full bg-white dark:bg-slate-900" />
                : <div className="min-h-screen flex items-center justify-center"><SynapticLoader size="xl" /></div>
        }>`
);

fs.writeFileSync('src/routes/AppRoutes.tsx', updated);
console.log('AppRoutes.tsx patched');
