import { useEffect, useRef } from 'react';
import supabase from '../lib/supabase';
import {
  useQueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useNotificationStore } from '../stores/useNotificationStore';

export function useAppVisibilityReawakening() {
  const queryClient = useQueryClient();
  const lastRecoverAtRef = useRef(0);

  useEffect(() => {
    const recoverApp = async (source: string) => {
      const now = Date.now();

      // Prevent duplicate recovery storms
      if (now - lastRecoverAtRef.current < 1500) return;

      lastRecoverAtRef.current = now;

      console.log(`App recovery triggered from: ${source}`);

      try {
        // Refresh Supabase auth session
        await supabase.auth.getSession();

        // Resume paused React Query mutations
        await queryClient.resumePausedMutations();

        // Refresh active queries safely
        queryClient
          .invalidateQueries({ refetchType: 'active' })
          .catch(console.error);

        queryClient
          .refetchQueries({ type: 'active' })
          .catch(console.error);
      } catch (error) {
        console.error('App recovery failed:', error);
      }
    };

    // Web / PWA visibility handling
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';

      focusManager.setFocused(isVisible);

      if (isVisible) {
        onlineManager.setOnline(navigator.onLine);
        recoverApp('visibilitychange');
      }
    };

    // Browser online event
    const handleOnline = () => {
      onlineManager.setOnline(true);

      useNotificationStore.getState().showToast({
        title: 'Reconnected',
        message: 'Connection restored. Syncing latest quiz data...',
        variant: 'sync',
        duration: 3500,
      });

      recoverApp('online');
    };

    // Browser offline event
    const handleOffline = () => {
      onlineManager.setOnline(false);

      useNotificationStore.getState().showToast({
        title: 'You are offline',
        message:
          'Changes are kept locally and will sync when internet returns.',
        variant: 'offline',
      });
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Native App (Capacitor) listener
    let capListener: any = null;

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener(
        'appStateChange',
        ({ isActive }) => {
          focusManager.setFocused(isActive);

          if (isActive) {
            onlineManager.setOnline(true);
            recoverApp('capacitor-appStateChange');
          }
        }
      ).then(listener => {
        capListener = listener;
      });
    }

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (capListener) capListener.remove();
    };
  }, [queryClient]);
}
