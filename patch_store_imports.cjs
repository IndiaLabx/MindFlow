const fs = require('fs');

const file = 'src/features/quiz/stores/useFlashcardStore.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /import \{ Idiom, OWSWord, SynonymWord, InitialFilters \} from '\.\.\/types';/,
  `import { Idiom, OWSWord, InitialFilters } from '../../../types/models';\nimport { SynonymWord } from '../types';`
);

fs.writeFileSync(file, code);
