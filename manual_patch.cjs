const fs = require('fs');

// Patch Phase 1
let file = 'src/features/synonyms/components/SynonymPhase1Session.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `    // Load and process data based on grouping mode
    useEffect(() => {
        setIsLoading(true);
        const parsed = rawSynonymsData as unknown as SynonymWord[];

        // Ensure some basic sorting so chunking is deterministic
        const sortedData = [...parsed].sort((a, b) => a.word.localeCompare(b.word));`;

const replace1 = `    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

    // Load and process data based on grouping mode
    useEffect(() => {
        setIsLoading(true);
        if (isDataLoading) return;
        if (!fetchedData || fetchedData.length === 0) {
            setIsLoading(false);
            return;
        }

        // Ensure some basic sorting so chunking is deterministic
        const sortedData = [...fetchedData].sort((a, b) => a.word.localeCompare(b.word));`;

content = content.replace(target1, replace1);
fs.writeFileSync(file, content, 'utf8');

// Patch Quiz Session
file = 'src/features/synonyms/components/SynonymQuizSession.tsx';
content = fs.readFileSync(file, 'utf8');

const target2 = `        const modeParam = searchParams.get('mode') as 'imposter' | 'connect' | 'speed' | null;
        setMode(modeParam || 'imposter');

        const parsedData = rawSynonymsData as unknown as SynonymWord[];
        // Sort by importance to prefer high frequency
        parsedData.sort((a, b) => b.importance_score - a.importance_score);
        setData(parsedData);
        setIsLoading(false);
    }, []);`;

const replace2 = `        const modeParam = searchParams.get('mode') as 'imposter' | 'connect' | 'speed' | null;
        setMode(modeParam || 'imposter');

        if (!isDataLoading && fetchedData && fetchedData.length > 0) {
            const sortedData = [...fetchedData].sort((a, b) => b.importance_score - a.importance_score);
            setData(sortedData);
            setIsLoading(false);
        } else if (!isDataLoading && (!fetchedData || fetchedData.length === 0)) {
            setIsLoading(false);
        }
    }, [fetchedData, isDataLoading]);`;

content = content.replace(`    useEffect(() => {
        // Parse Hash Router params to get mode`, `    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

    useEffect(() => {
        // Parse Hash Router params to get mode`);

content = content.replace(target2, replace2);

fs.writeFileSync(file, content, 'utf8');

console.log("Manual patch applied successfully.");
