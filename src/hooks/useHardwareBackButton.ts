import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotificationStore } from '../stores/useNotificationStore';

export const useHardwareBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const lastBackPress = useRef<number>(0);

    useEffect(() => {
        const handleBackButton = async () => {
            const rootPaths = ['/', '/dashboard', '/community', '/mcqs', '/english', '/school', '/tools', '/ai'];

            // Allow exit on precise root paths
            if (rootPaths.includes(location.pathname)) {
                const currentTime = new Date().getTime();

                // If pressed within 2 seconds
                if (currentTime - lastBackPress.current < 2000) {
                    App.exitApp();
                } else {
                    lastBackPress.current = currentTime;
                    useNotificationStore.getState().showToast({
                        title: 'Exit App',
                        message: 'Press back again to exit',
                        variant: 'info',
                        duration: 2000
                    });
                }
            } else {
                // Navigate back in React Router history for nested paths
                navigate(-1);
            }
        };

        // Add back button listener
        const listener = App.addListener('backButton', handleBackButton);

        return () => {
            // Remove listener when hook unmounts/reruns
            listener.then(l => l.remove());
        };
    }, [navigate, location.pathname]);
};
