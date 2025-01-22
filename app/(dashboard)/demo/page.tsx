"use client";
import Notifications from "@/components/Notification";
import React from "react";

const Page = () => {
  const handleSendNotification = async () => {
    const fcmToken =
      "diYXKtMORCFgb6Rd6P24-e:APA91bHpyZS2A6R-9StNEM5Ku_O-NI6XpDWWXjsZg2JYDlWWQES6onypT4iMt0muuZ9kkwLK9hTC8FeyTqIWM3RPIiBtKniIcXDTMH8HYZKM36OO6Sm8oT4";

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fcmToken,
          title: "Hello!",
          body: "This is a test notification.",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Notification sent successfully!");
      } else {
        alert(`Failed to send notification: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("An error occurred while sending the notification.");
    }
  };

  return (
    <div>
      <Notifications />
      <h1>Send Notification</h1>
      <button onClick={handleSendNotification}>Send Notification</button>
    </div>
  );
};

export default Page;
