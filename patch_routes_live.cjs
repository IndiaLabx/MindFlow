const fs = require('fs');
const path = 'src/routes/AppRoutes.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add Lazy import
if (!content.includes('LiveQuizRoom')) {
    content = content.replace(
        "const OWSConfig = lazy(() => import('../features/ows/OWSConfig').then(m => ({ default: m.OWSConfig })));",
        "const OWSConfig = lazy(() => import('../features/ows/OWSConfig').then(m => ({ default: m.OWSConfig })));\nconst LiveQuizRoom = lazy(() => import('../features/quiz/live/LiveQuizRoom').then(m => ({ default: m.LiveQuizRoom })));"
    );

    // Add Route
    const routeAddition = `
                {/* Learning Mode: Interactive per-question session */}
                <Route path="/quiz/live/:id" element={<LiveQuizRoom />} />
`;
    content = content.replace("{/* Learning Mode: Interactive per-question session */}", routeAddition);

    fs.writeFileSync(path, content, 'utf8');
    console.log('AppRoutes.tsx updated successfully');
} else {
    console.log('AppRoutes.tsx already updated');
}
