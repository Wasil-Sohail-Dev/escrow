"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { setupFCMListener } from "@/lib/firebase";
import NotificationItem from "@/components/dashboard/NotificationItem";
import { useNotification } from "@/contexts/NotificationProvider";
import { useUser } from "@/contexts/UserContext";

const NotificationsPage = () => {
  const { user } = useUser();
  const { notifications, setNotifications, markAsRead } = useNotification();
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/fetch-notifications", {
        method: "POST",
        body: JSON.stringify({ receiverId: user._id, status: "unread", limit: "all" }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch + real-time updates
  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupFCMListener(setNotifications);
    }
  }, [user]);

  return (
    <>
      <Topbar
        title="Notifications"
        description="See all your updates and notifications here."
      />
      <div className="mt-[85px] w-full">
        <h1 className="text-[20px] lg:font-[700] lg:leading-[30px] mb-2 text-[#292929] dark:text-dark-text">
          Notifications
        </h1>

        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={() => notification._id && markAsRead(notification._id)}
            />
          ))
        ) : (
          <p>No notifications found.</p>
        )}
      </div>
    </>
  );
};

export default NotificationsPage;
