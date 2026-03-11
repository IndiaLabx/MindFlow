const fs = require('fs');

// Create service
fs.writeFileSync('src/features/synonyms/services/synonymService.ts', `import { supabase } from '../../../lib/supabase';
import { SynonymWord } from '../../quiz/types';

export const fetchAllSynonyms = async (): Promise<SynonymWord[]> => {
    let allData: any[] = [];
    let from = 0;
    const limit = 1000;
    let hasMore = true;

    try {
        while (hasMore) {
            const { data, error } = await supabase
                .from('synonym')
                .select('*')
                .range(from, from + limit - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                from += limit;
                if (data.length < limit) hasMore = false;
            } else {
                hasMore = false;
            }
        }

        return allData.map(item => ({
            ...item,
            hindiMeaning: item.hindi_meaning || item.hindiMeaning,
        })) as SynonymWord[];
    } catch (e) {
        console.error("Failed to fetch all synonyms", e);
        return [];
    }
};`);

// Create hook
fs.writeFileSync('src/features/synonyms/hooks/useSynonymsData.ts', `import { useState, useEffect } from 'react';
import { SynonymWord } from '../../quiz/types';
import { fetchAllSynonyms } from '../services/synonymService';

export const useSynonymsData = () => {
    const [data, setData] = useState<SynonymWord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const fetchedData = await fetchAllSynonyms();
                if (isMounted) {
                    setData(fetchedData);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) setError(err as Error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, []);

    return { data, isLoading, error };
};`);

// Patch Config
let file = 'src/features/synonyms/SynonymsConfig.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("import rawSynonymsData from '../quiz/data/processed_synonyms.json';", "import { useSynonymsData } from './hooks/useSynonymsData';");
content = content.replace(/import { SynonymWord } from '\.\.\/quiz\/types';/, "import { SynonymWord } from '../quiz/types';");
const oldEffectConfig = `    useEffect(() => {
        // Load and sort data
        const load = async () => {
            try {
                // In a real scenario, this might be a fetch or complex parse
                const parsed = rawSynonymsData as unknown as SynonymWord[];

                // Sort by importance_score descending (Heatmap Hot first)
                parsed.sort((a, b) => b.importance_score - a.importance_score);

                setData(parsed);
            } catch(e) {
                console.error("Failed to load synonyms data", e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);`;
const newEffectConfig = `    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

    useEffect(() => {
        if (!isDataLoading && fetchedData && fetchedData.length > 0) {
            const sortedData = [...fetchedData].sort((a, b) => b.importance_score - a.importance_score);
            setData(sortedData);
            setIsLoading(false);
        } else if (!isDataLoading && (!fetchedData || fetchedData.length === 0)) {
            setIsLoading(false);
        }
    }, [fetchedData, isDataLoading]);`;
content = content.replace(oldEffectConfig, newEffectConfig);
fs.writeFileSync(file, content, 'utf8');

// Patch Phase 1
file = 'src/features/synonyms/components/SynonymPhase1Session.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace("import rawSynonymsData from '../../quiz/data/processed_synonyms.json';", "import { useSynonymsData } from '../hooks/useSynonymsData';");
const oldEffectPhase1 = `    // Load and process data based on grouping mode
    useEffect(() => {
        setIsLoading(true);
        const parsed = rawSynonymsData as unknown as SynonymWord[];

        // Ensure some basic sorting so chunking is deterministic
        const sortedData = [...parsed].sort((a, b) => a.word.localeCompare(b.word));

        let groups: WordGroup[] = [];

        if (groupingMode === 'chunked') {
            const chunkSize = 50;
            for (let i = 0; i < sortedData.length; i += chunkSize) {
                const chunk = sortedData.slice(i, i + chunkSize);
                groups.push({
                    name: \`Chunk \${i / chunkSize + 1} (\${chunk[0].word} - \${chunk[chunk.length - 1].word})\`,
                    words: chunk
                });
            }
        } else {
            // alphabetical
            const map = new Map<string, SynonymWord[]>();
            sortedData.forEach(w => {
                const letter = w.word.charAt(0).toUpperCase();
                if (!map.has(letter)) map.set(letter, []);
                map.get(letter)!.push(w);
            });
            const letters = Array.from(map.keys()).sort();
            letters.forEach(l => {
                groups.push({
                    name: \`Letter \${l}\`,
                    words: map.get(l)!
                });
            });
        }

        setGroups(groups);
        setIsLoading(false);
    }, [groupingMode]);`;

const newEffectPhase1 = `    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

    useEffect(() => {
        setIsLoading(true);
        if (isDataLoading) return;

        if (!fetchedData || fetchedData.length === 0) {
            setIsLoading(false);
            return;
        }

        const sortedData = [...fetchedData].sort((a, b) => a.word.localeCompare(b.word));
        let groups: WordGroup[] = [];

        if (groupingMode === 'chunked') {
            const chunkSize = 50;
            for (let i = 0; i < sortedData.length; i += chunkSize) {
                const chunk = sortedData.slice(i, i + chunkSize);
                groups.push({
                    name: \`Chunk \${i / chunkSize + 1} (\${chunk[0].word} - \${chunk[chunk.length - 1].word})\`,
                    words: chunk
                });
            }
        } else {
            const map = new Map<string, SynonymWord[]>();
            sortedData.forEach(w => {
                const letter = w.word.charAt(0).toUpperCase();
                if (!map.has(letter)) map.set(letter, []);
                map.get(letter)!.push(w);
            });
            const letters = Array.from(map.keys()).sort();
            letters.forEach(l => {
                groups.push({
                    name: \`Letter \${l}\`,
                    words: map.get(l)!
                });
            });
        }

        setGroups(groups);
        setIsLoading(false);
    }, [fetchedData, isDataLoading, groupingMode]);`;

content = content.replace(oldEffectPhase1, newEffectPhase1);
content = content.replace("const [groups, setGroups] = useState<WordGroup[]>([]);\n", "");
fs.writeFileSync(file, content, 'utf8');

// Patch QuizSession
file = 'src/features/synonyms/components/SynonymQuizSession.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace("import rawSynonymsData from '../../quiz/data/processed_synonyms.json';", "import { useSynonymsData } from '../hooks/useSynonymsData';");
const oldEffectQuiz = `    useEffect(() => {
        // Parse Hash Router params to get mode
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(hash.split('?')[1] || '');
        const modeParam = searchParams.get('mode') as 'imposter' | 'connect' | 'speed' | null;
        setMode(modeParam || 'imposter');

        const parsedData = rawSynonymsData as unknown as SynonymWord[];
        // Sort by importance to prefer high frequency
        parsedData.sort((a, b) => b.importance_score - a.importance_score);
        setData(parsedData);
        setIsLoading(false);
    }, []);`;
const newEffectQuiz = `    const { data: fetchedData, isLoading: isDataLoading } = useSynonymsData();

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
    }, [fetchedData, isDataLoading]);`;
content = content.replace(oldEffectQuiz, newEffectQuiz);
fs.writeFileSync(file, content, 'utf8');

console.log("All files patched successfully.");
