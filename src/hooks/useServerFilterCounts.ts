import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InitialFilters } from '../features/quiz/types';

/**
 * Custom hook to calculate the count of available questions for each filter option
 * via a Supabase RPC call instead of client-side web workers.
 *
 * This intelligently calculates counts contextually across 50k+ rows instantly.
 */
export function useServerFilterCounts(selectedFilters: InitialFilters) {
  const [counts, setCounts] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_contextual_filter_counts', {
          selected_filters: selectedFilters
        });

        if (error) {
          console.error('Error fetching contextual filter counts from Supabase:', error);
          return;
        }

        if (data) {
          setCounts(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching filter counts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, [selectedFilters]);

  return { counts, loading };
}
