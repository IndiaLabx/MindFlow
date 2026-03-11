const fs = require('fs');

const path = 'src/features/quiz/engine/plugins/synonymPlugin.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /from\('Synonyms'\)/g,
  "from('synonym')"
);

fs.writeFileSync(path, code);
console.log('Patched synonymPlugin.ts');
