import { supabase } from '../../../lib/supabase';
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
};