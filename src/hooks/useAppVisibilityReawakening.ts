import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function useAppVisibilityReawakening() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleReawaken = async () => {
      console.log('App woke up! Forcing session refresh and network reconnect...');

      // 1. Force Supabase to check and refresh the auth session
      await supabase.auth.getSession();

      // 2. Tell React Query that the network is back online
      // This forces React Query to retry any stalled "pending" queries
      queryClient.resumePausedMutations();
    };

    // Web / PWA listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReawaken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Native App (Capacitor) listener
    let capListener: any = null;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          handleReawaken();
        }
      }).then(listener => {
         capListener = listener;
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (capListener) {
        capListener.remove();
      }
    };
  }, [queryClient]);
}
