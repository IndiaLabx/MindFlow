import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useNotificationStore } from '../stores/useNotificationStore';

export function useAppVisibilityReawakening() {
  const queryClient = useQueryClient();
  const lastRecoverAtRef = useRef(0);

  useEffect(() => {
    const recoverApp = async (source: string) => {
      const now = Date.now();
      if (now - lastRecoverAtRef.current < 1500) return;
      lastRecoverAtRef.current = now;

      console.log(`App recovery triggered from: ${source}`);
      try {
        await supabase.auth.getSession();
        await queryClient.resumePausedMutations();
        await queryClient.invalidateQueries();
        await queryClient.refetchQueries({ type: 'active' });
      } catch (error) {
        console.error('App recovery failed:', error);
      }
    };

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      focusManager.setFocused(isVisible);
      if (isVisible) {
        onlineManager.setOnline(navigator.onLine);
        recoverApp('visibilitychange');
      }
    };

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

    const handleOffline = () => {
      onlineManager.setOnline(false);
      useNotificationStore.getState().showToast({
        title: 'You are offline',
        message: 'Changes are kept locally and will sync when internet returns.',
        variant: 'offline',
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let capListener: any = null;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        focusManager.setFocused(isActive);
        if (isActive) {
          onlineManager.setOnline(true);
          recoverApp('capacitor-appStateChange');
        }
      }).then(listener => {
        capListener = listener;
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (capListener) capListener.remove();
    };
  }, [queryClient]);
}
