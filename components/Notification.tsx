"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

interface Notification {
  message: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket connection with proper path and transport
    const socket = io("ws://localhost:3000/api/socket", {
      transports: ["websocket"],
      path: "/api/socket",
    });

    // Handle connection
    socket.on("connect", () => {
      setConnected(true);
      console.log("WebSocket connected");
    });

    // Handle connection error
    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setConnected(false);
    });

    // Handle incoming notifications
    socket.on("notification", (data) => {
      console.log("New notification received:", data);
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Real-time Notifications</h1>
      {connected ? <p>Connected to WebSocket</p> : <p>Connecting...</p>}
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
}
