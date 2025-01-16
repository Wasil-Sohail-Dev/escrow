import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
export const messaging = getMessaging(app);

// Request permission to send push notifications and get the FCM token
export const requestNotificationPermission = async () => {
    try {
        // Request permission to show notifications
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            // Get FCM token if permission is granted
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            console.log("FCM Token:", token);
            return token;
        } else {
            console.error("Notification permission denied.");
            return null;
        }
    } catch (error) {
        console.error("Error getting notification permission or token:", error);
        return null;
    }
};

// Set up a listener for incoming notifications (when the app is in the foreground)
export const setupNotificationListener = () => {
    onMessage(messaging, (payload) => {
        console.log("Notification received:", payload);
        // Handle incoming notifications here (e.g., show in-app notifications)
    });
};
