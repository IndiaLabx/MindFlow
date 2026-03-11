const fs = require('fs');
const file = 'src/features/synonyms/components/SynonymPhase1Session.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variables
content = content.replace(
    "const [detailsVisible, setDetailsVisible] = useState(false);",
    "const [detailsVisible, setDetailsVisible] = useState(false);\n    const [allSynonymsExpanded, setAllSynonymsExpanded] = useState(false);\n    const [allAntonymsExpanded, setAllAntonymsExpanded] = useState(false);"
);

// 2. Add reset lines to functions that change words
// loadGroup
content = content.replace(
    "setDetailsVisible(false);\n        setExpandedGroupIdx(idx);",
    "setDetailsVisible(false);\n        setAllSynonymsExpanded(false);\n        setAllAntonymsExpanded(false);\n        setExpandedGroupIdx(idx);"
);

// jumpToWord
content = content.replace(
    "setCurrentWordIndex(wordIdx);\n        setDetailsVisible(false);",
    "setCurrentWordIndex(wordIdx);\n        setDetailsVisible(false);\n        setAllSynonymsExpanded(false);\n        setAllAntonymsExpanded(false);"
);

// nextWord
content = content.replace(
    "setCurrentWordIndex(currentWordIndex + 1);\n            setDetailsVisible(false);",
    "setCurrentWordIndex(currentWordIndex + 1);\n            setDetailsVisible(false);\n            setAllSynonymsExpanded(false);\n            setAllAntonymsExpanded(false);"
);

// prevWord - standard
content = content.replace(
    "setCurrentWordIndex(currentWordIndex - 1);\n            setDetailsVisible(false);",
    "setCurrentWordIndex(currentWordIndex - 1);\n            setDetailsVisible(false);\n            setAllSynonymsExpanded(false);\n            setAllAntonymsExpanded(false);"
);

// prevWord - jump group
content = content.replace(
    "setExpandedGroupIdx(prevGroupIdx);\n                    setDetailsVisible(false);",
    "setExpandedGroupIdx(prevGroupIdx);\n                    setDetailsVisible(false);\n                    setAllSynonymsExpanded(false);\n                    setAllAntonymsExpanded(false);"
);

fs.writeFileSync(file, content);
