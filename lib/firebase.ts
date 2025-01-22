import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

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
console.log("Firebase initialized:", app.name); // Should log the app name

// Messaging instance (browser-only)
export const messaging = async () => {
    if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) {
            return getMessaging(app);
        } else {
            console.warn("Firebase Messaging is not supported in this browser.");
        }
    } else {
        console.warn("Firebase Messaging cannot be used on the server.");
    }
    return null;
};

// Request notification permission
export const requestNotificationPermission = async () => {
    const msg = await messaging();
    if (!msg) {
        console.warn("Messaging not initialized. Skipping token request.");
        return;
    }

    try {
        console.log("Requesting FCM token...");
        const token = await getToken(msg, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
            console.log("FCM Token:", token);
        } else {
            console.log("No registration token available. Request permission manually.");
        }
    } catch (error) {
        console.error("Error retrieving FCM token:", error);
    }
};

