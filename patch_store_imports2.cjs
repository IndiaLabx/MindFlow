const fs = require('fs');

const file = 'src/features/quiz/stores/useFlashcardStore.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /import \{ Idiom, OWSWord, InitialFilters \} from '\.\.\/\.\.\/\.\.\/types\/models';/,
  `import { Idiom, OWS, InitialFilters } from '../../../types/models';`
);

code = code.replace(/OWSWord\[\]/g, 'OWS[]');
code = code.replace(/ows: OWSWord\[\]/g, 'ows: OWS[]');

fs.writeFileSync(file, code);
