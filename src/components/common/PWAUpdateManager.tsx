import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';
import React, { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useNotification } from '../../stores/useNotificationStore';

export const PWAUpdateManager: React.FC = () => {
  const { showToast } = useNotification();
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const IDLE_TIME_MS = 120000; // 2 minutes of inactivity
  const intervalMS = 60 * 60 * 1000; // 1 hour for background check

  const isUnsafeToAutoReload = () => {
    const quizStateStr = localStorage.getItem('mindflow-quiz-session');
    if (!quizStateStr) return false;
    try {
      const quizState = JSON.parse(quizStateStr);
      const status = quizState?.status;
      return status === 'quiz' || status === 'config' || status === 'blueprints';
    } catch {
      return false;
    }
  };

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;
      registrationRef.current = registration;
    },
    onNeedRefresh() {
      showToast({
        title: 'Update Available',
        message: 'Update ready. It will apply when app is idle and safe.',
        variant: 'info',
      });

      resetIdleTimer();
    }
  });

  // Periodic + visibility based update checks with explicit cleanup
  useEffect(() => {
    const registration = registrationRef.current;
    if (!registration) return;

    const checkForUpdate = () => {
      if (registration.installing) return;
      if (('connection' in navigator) && !navigator.onLine) return;
      registration.update();
    };

    updateIntervalRef.current = setInterval(checkForUpdate, intervalMS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [intervalMS, needRefresh]);

  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    setIsIdle(false);
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIME_MS);
  };

  useEffect(() => {
    if (!needRefresh) return;

    const events = ['touchstart', 'mousemove', 'keydown', 'scroll', 'click'];
    const handleActivity = () => resetIdleTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetIdleTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [needRefresh]);

  useEffect(() => {
    if (needRefresh && isIdle) {
      if (document.visibilityState !== 'visible' || isUnsafeToAutoReload()) {
        return;
      }

      const performSmartReload = async () => {
        try {
          const quizStateStr = localStorage.getItem('mindflow-quiz-session');
          if (quizStateStr) {
            const quizState = JSON.parse(quizStateStr);
            if (quizState.status === 'quiz') {
              const { data } = await supabase.auth.getSession();

              const pausedState = { ...quizState, isPaused: true };
              localStorage.setItem('mindflow-quiz-session', JSON.stringify(pausedState));

              if (data.session) {
                await db.saveActiveSession(data.session.user.id, pausedState);
              }
            }
          }

          localStorage.setItem('mindflow_auto_updated', 'true');
        } catch (error) {
          console.error('Failed to save state during auto-update', error);
        } finally {
          updateServiceWorker(true);
        }
      };

      performSmartReload();
    }
  }, [needRefresh, isIdle, updateServiceWorker]);

  return null;
};
