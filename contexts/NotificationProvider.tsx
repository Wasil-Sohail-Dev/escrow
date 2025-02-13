"use client";

import {
  setupFCMListener,
  requestNotificationPermission,
} from "@/lib/firebase";
import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface Notification {
  _id?: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt?: string;
  status?: "unread" | "read";
  type?: "system" | "user" | "payment" | "alert";
}

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAsRead: (id: string) => void;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Register Service Worker for FCM background notifications
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          console.log("Service Worker registered successfully.");
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  // Fetch Notifications & Listen for FCM Messages
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const res = await fetch("/api/fetch-notifications", {
          method: "POST",
          body: JSON.stringify({ userId: user._id }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (user) {
      requestNotificationPermission(user._id);
      setupFCMListener(setNotifications); // ✅ Pass the correct function
      fetchNotifications();
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/mark-read", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: id }),
        headers: { "Content-Type": "application/json" },
      });

      // Update state after marking as read
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: "read" } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, setNotifications, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
