"use client";

import { requestNotificationPermission } from "@/lib/firebase";
import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationContextType {
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Enable service worker registration and notification permission request in both production and development
    if (
      (process.env.NODE_ENV === "production" ||
        process.env.NODE_ENV === "development") &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(() => {
          console.log("Service Worker registered");
        })
        .catch((err) => {
          console.error("Service Worker registration failed: ", err);
        });

      requestNotificationPermission(); // Request notification permission
    }
  }, []);

  const [notifications, setNotifications] = useState<any[]>([]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
