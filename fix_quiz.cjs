const fs = require('fs');
let file = 'src/features/synonyms/components/SynonymQuizSession.tsx';
let content = fs.readFileSync(file, 'utf8');

// Due to double replacement in my script earlier, it didn't declare 'fetchedData' correctly inside the component.

// I will just rewrite the component correctly by replacing the entire useEffect block to ensure it's spotless.
content = content.replace(`    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

    useEffect(() => {
        // Parse Hash Router params to get mode
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(hash.split('?')[1] || '');
        const modeParam = searchParams.get('mode') as 'imposter' | 'connect' | 'speed' | null;
        setMode(modeParam || 'imposter');

        if (!isDataLoading && fetchedData && fetchedData.length > 0) {
            const sortedData = [...fetchedData].sort((a, b) => b.importance_score - a.importance_score);
            setData(sortedData);
            setIsLoading(false);
        } else if (!isDataLoading && (!fetchedData || fetchedData.length === 0)) {
            setIsLoading(false);
        }
    }, [fetchedData, isDataLoading]);`, `    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

    useEffect(() => {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(hash.split('?')[1] || '');
        const modeParam = searchParams.get('mode') as 'imposter' | 'connect' | 'speed' | null;
        setMode(modeParam || 'imposter');

        if (!isDataLoading && fetchedData && fetchedData.length > 0) {
            const sortedData = [...fetchedData].sort((a, b) => b.importance_score - a.importance_score);
            setData(sortedData);
            setIsLoading(false);
        } else if (!isDataLoading && (!fetchedData || fetchedData.length === 0)) {
            setIsLoading(false);
        }
    }, [fetchedData, isDataLoading]);`);

// It looks like my previous regex failed to insert 'const { data: fetchedData...'. Let's find exactly where it starts.
const matchStart = `    useEffect(() => {
        // Parse Hash Router params to get mode`;

if(content.includes(matchStart)) {
  content = content.replace(matchStart, `    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();\n\n` + matchStart);
}

fs.writeFileSync(file, content, 'utf8');
