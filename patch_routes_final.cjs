const fs = require('fs');
const file = 'src/routes/AppRoutes.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/startSynonymFlashcards,/g, '');
code = code.replace(/startFlashcards, startOWSFlashcards,/g, '');
code = code.replace(/finishFlashcards,/g, '');

code = code.replace(/<Route path="\/idioms\/list" element=\{<IdiomsList data=\{state\.activeIdioms \|\| \[\]\} \/>\} \/>/g, `<Route path="/idioms/list" element={<IdiomsList data={flashcardStore.idioms} />} />`);

code = code.replace(/<Route path="\/synonyms\/list" element=\{<SynonymClusterList data=\{state\.activeSynonyms \|\| \[\]\} onSelectWord=\{\(word\) => \{ jumpToQuestion\(state\.activeSynonyms\?\.findIndex\(w => w\.id === word\.id\) \|\| 0\); navTo\('\/synonyms\/session'\); \}\} onExit=\{\(\) => navTo\('\/synonyms\/config'\)\} \/>\} \/>/g, `<Route path="/synonyms/list" element={<SynonymClusterList data={flashcardStore.synonyms} onSelectWord={(word) => { flashcardStore.jumpToCard(flashcardStore.synonyms.findIndex(w => w.id === word.id) || 0); navTo('/synonyms/session'); }} onExit={() => navTo('/synonyms/config')} />} />`);

fs.writeFileSync(file, code);
