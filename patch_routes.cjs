const fs = require('fs');

const routesPath = 'src/routes/AppRoutes.tsx';
let routesCode = fs.readFileSync(routesPath, 'utf8');

// Add imports
const importsToAdd = `
const AIChatPage = lazy(() => import('../features/ai/chat/AIChatPage').then(m => ({ default: m.AIChatPage })));
const AITalkPage = lazy(() => import('../features/ai/talk/AITalkPage').then(m => ({ default: m.AITalkPage })));
`;

routesCode = routesCode.replace(
    'const SemanticSearch = lazy(() => import(\'../features/ai/SemanticSearch\').then(m => ({ default: m.SemanticSearch })));',
    'const SemanticSearch = lazy(() => import(\'../features/ai/SemanticSearch\').then(m => ({ default: m.SemanticSearch })));\n' + importsToAdd
);

// Add routes
const routesToAdd = `
                    <Route path="/ai/chat" element={<AIChatPage />} />
                    <Route path="/ai/talk" element={<AITalkPage />} />
`;

routesCode = routesCode.replace(
    '<Route path="/ai/semantic-search" element={<SemanticSearch />} />',
    '<Route path="/ai/semantic-search" element={<SemanticSearch />} />\n' + routesToAdd
);

fs.writeFileSync(routesPath, routesCode);
console.log('AppRoutes.tsx patched successfully.');
