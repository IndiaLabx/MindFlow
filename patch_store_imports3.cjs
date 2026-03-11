const fs = require('fs');

const file = 'src/features/quiz/stores/useFlashcardStore.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /import \{ Idiom, OWS, InitialFilters \} from '\.\.\/\.\.\/\.\.\/types\/models';/,
  `import { Idiom, OneWord, InitialFilters } from '../../../types/models';`
);

code = code.replace(/OWS\[\]/g, 'OneWord[]');

fs.writeFileSync(file, code);
