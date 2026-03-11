const fs = require('fs');
const file = 'src/features/quiz/types/store.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/  \/\*\* The subset of idioms active in the current session \(if applicable\)\. \*\/\s*\n\s*activeIdioms\?: Idiom\[\];\s*\n\s*\/\*\* The subset of OWS active in the current session \(if applicable\)\. \*\/\s*\n\s*activeOWS\?: OneWord\[\];\s*\n\s*\/\*\* The subset of Synonyms active in the current session \*\/\s*\n\s*activeSynonyms\?: SynonymWord\[\];\s*\n/, '');

fs.writeFileSync(file, code);
