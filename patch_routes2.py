import re

with open('src/routes/AppRoutes.tsx', 'r') as f:
    content = f.read()

# Add a route for blueprints.
# Find the end of Dashboard Routes and insert blueprints
if 'path="/blueprints"' not in content:
    content = content.replace('<Route path="/quiz/config" element={<QuizConfigWrapper />} />', '<Route path="/quiz/config" element={<QuizConfigWrapper />} />\n                <Route path="/blueprints" element={<ExamBlueprintsHub onBack={() => navigate(\'/dashboard\')} onLaunchBlueprint={(bp) => navigate(`/quiz/blueprint/${bp.id}`)} />} />')

with open('src/routes/AppRoutes.tsx', 'w') as f:
    f.write(content)
