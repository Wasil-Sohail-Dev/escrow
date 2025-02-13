import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";
import { fcmRegister } from "./actions/fcm.action";
import { toast } from "sonner"; // Import ShadCN Toaster

interface Notification {
  _id?: string;
  title: string;
  message: string;
  timestamp: string;
  status?: "unread" | "read";
  type?: "system" | "user" | "payment" | "alert";
  link?: string;
}

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

// Listen for incoming messages and update the notification state
export const setupFCMListener = async (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  const msg = await messaging();
  if (!msg) return;

  onMessage(msg, (payload) => {
    const { title, body } = payload.notification || {};
    const link = payload.data?.link || "/notifications";
    if (title && body) {
      const newNotification: Notification = {
        title,
        message: body,
        timestamp: new Date().toISOString(),
        link,
      };
      // Show toast notification using Sonner
      toast(title, {
        description: body,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => {
            window.focus();
            window.location.href = link;
          },
        },
      });
      // Push browser notification if granted
      if (Notification.permission === "granted") {
        const notification = new Notification(title, {
          body,
          data: { link },
        });

        // Handle click on browser notification
        notification.onclick = () => {
          window.focus();
          window.location.href = link;
        };
      }

      // Update notifications state
      setNotifications((prevNotifications) => [
        newNotification,
        ...prevNotifications,
      ]);
    }
  });
};

// Request notification permission and register FCM token
export const requestNotificationPermission = async (userId: string) => {
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
      // Register or update the FCM token on the server
      await fcmRegister(userId, token, "web");
    } else {
      console.log(
        "No registration token available. Request permission manually."
      );
    }
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
  }
};
