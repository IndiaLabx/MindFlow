const fs = require('fs');
const file = 'src/routes/AppRoutes.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const navTo = useNavigate\(\);\n    const flashcardStore = useFlashcardStore\(\);/,
  `const navTo = useNavigate();\n    const flashcardStore = useFlashcardStore();`
);

// If the global replacement failed, let's just re-inject it exactly.
// It seems the issue is that it wasn't added correctly or `useFlashcardStore` is out of scope for the route handlers.
