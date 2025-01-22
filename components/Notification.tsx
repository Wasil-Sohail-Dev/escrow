"use client";

import { messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";

export default function Notifications() {
  useEffect(() => {
    const fetchMessaging = async () => {
      const msg = await messaging();
      if (!msg) return;

      onMessage(msg, (payload) => {
        console.log("Foreground notification received:", payload);

        // Optionally display a custom alert or update UI
        alert(`New notification: ${payload.notification?.title}`);
      });
    };

    fetchMessaging();
  }, []);

  return (
    <div>
      <h1>Real-time Notifications</h1>
    </div>
  );
}
