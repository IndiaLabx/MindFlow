const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/<HashRouter>/, '<HashRouter>');
// The frontend runs on hashrouter. We need to go to /#/synonyms/session
