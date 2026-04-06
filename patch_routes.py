import re

with open('src/routes/AppRoutes.tsx', 'r') as f:
    content = f.read()

# Add the blueprint hub import
if 'ExamBlueprintsHub' not in content:
    content = content.replace("const AdminNotifications =", "const ExamBlueprintsHub = lazy(() => import('../features/quiz/components/ExamBlueprintsHub').then(m => ({ default: m.ExamBlueprintsHub })));\nconst AdminNotifications =")

with open('src/routes/AppRoutes.tsx', 'w') as f:
    f.write(content)
