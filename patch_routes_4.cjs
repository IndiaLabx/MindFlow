const fs = require('fs');
const file = 'src/routes/AppRoutes.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const navigate = useNavigate\(\);/,
  `const navigate = useNavigate();\n    const flashcardStore = useFlashcardStore();`
);

fs.writeFileSync(file, code);
