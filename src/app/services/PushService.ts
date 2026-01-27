import axios from 'axios';

const VAPID_PUBLIC_KEY = 'BJTZq7sxSDfCrkHu8BGA0SkBSVJX2dTEYpSL5wnjngZwvVfbD6p-q8FmVJdelcKBpZlHmPx_iVl5kFkgGtVxf9o';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const PushService = {
    async register(userId: string | null) {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Workers not supported');
            return;
        }

        if (!('PushManager' in window)) {
            console.log('Push Notifications not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Request Permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Permission not granted');
                    return;
                }

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
            }

            // Sync with backend
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${API_URL}/push/subscribe`, {
                userId,
                subscription
            });

            console.log('Successfully subscribed to Push Notifications');
        } catch (error) {
            console.error('Failed to register for Push Notifications:', error);
        }
    }
};
