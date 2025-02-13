import { useUser } from "@/contexts/UserContext";
import { setupFCMListener } from "@/lib/firebase";
import { useEffect, useState } from "react";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useUser();

  useEffect(() => {
    setupFCMListener(setNotifications);

    // Fetch past notifications from backend
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/fetch-notifications`, {
          method: "POST", // Change to POST
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?._id, // Replace with actual userId
            status: "unread", // Example: Fetch only unread notifications
          }),
        });

        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  return (
    <div className="relative">
      <button className="relative">
        🔔
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg p-2 rounded-md">
          {notifications.map((notif, index) => (
            <div key={index} className="p-2 border-b last:border-none">
              <strong>{notif.title}</strong>
              <p className="text-sm">{notif.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(notif.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
