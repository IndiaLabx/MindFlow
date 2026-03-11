const fs = require('fs');

const fixPhase1 = 'src/features/synonyms/components/SynonymPhase1Session.tsx';
let contentPhase1 = fs.readFileSync(fixPhase1, 'utf8');
if (!contentPhase1.includes("import { useSynonymsData }")) {
    contentPhase1 = "import { useSynonymsData } from '../hooks/useSynonymsData';\n" + contentPhase1;
    fs.writeFileSync(fixPhase1, contentPhase1);
    console.log("Patched SynonymPhase1Session.tsx");
}

const fixQuiz = 'src/features/synonyms/components/SynonymQuizSession.tsx';
let contentQuiz = fs.readFileSync(fixQuiz, 'utf8');
if (!contentQuiz.includes("import { useSynonymsData }")) {
    contentQuiz = "import { useSynonymsData } from '../hooks/useSynonymsData';\n" + contentQuiz;
    fs.writeFileSync(fixQuiz, contentQuiz);
    console.log("Patched SynonymQuizSession.tsx");
}
