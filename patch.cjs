const fs = require('fs');

const file = 'src/features/synonyms/SynonymsConfig.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "import React, { useMemo } from 'react';",
    "import React, { useState, useEffect, useMemo } from 'react';"
);

content = content.replace(
    "export const SynonymsConfig: React.FC<SynonymsConfigProps> = ({ onBack, onStart }) => {\n    const [data, setData] = useState<SynonymWord[]>([]);\n    const [isLoading, setIsLoading] = useState(true);",
    "export const SynonymsConfig: React.FC<SynonymsConfigProps> = ({ onBack, onStart }) => {\n    const navigate = useNavigate();\n    const [sortedData, setSortedData] = useState<SynonymWord[]>([]);\n    const [isDataLoading, setIsDataLoading] = useState(true);\n    const [error, setError] = useState<Error | null>(null);"
);

content = content.replace(
    "setData(parsed);",
    "setSortedData(parsed);"
);

content = content.replace(
    "console.error(\"Failed to load synonyms data\", e);",
    "console.error(\"Failed to load synonyms data\", e);\n                setError(e as Error);"
);

content = content.replace(
    "setIsLoading(false);",
    "setIsDataLoading(false);"
);

fs.writeFileSync(file, content);
console.log("Patched SynonymsConfig.tsx successfully.");
