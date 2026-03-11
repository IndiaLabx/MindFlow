const fs = require('fs');
let file = 'src/features/synonyms/components/SynonymQuizSession.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert useSynonymsData call correctly below setCurrentRound hook
const matchStart = `    const [currentRound, setCurrentRound] = useState(1);

    useEffect(() => {`;

const replaceWith = `    const [currentRound, setCurrentRound] = useState(1);

    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

    useEffect(() => {`;

content = content.replace(matchStart, replaceWith);

fs.writeFileSync(file, content, 'utf8');
