import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useAppVisibilityReawakening() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('App woke up! Forcing session refresh and network reconnect...');

        // 1. Force Supabase to check and refresh the auth session
        await supabase.auth.getSession();

        // 2. Tell React Query that the network is back online
        // This forces React Query to retry any stalled "pending" queries
        queryClient.resumePausedMutations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
}
