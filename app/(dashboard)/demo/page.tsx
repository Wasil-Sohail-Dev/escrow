"use client";
import Chat from "@/components/chat";
import NotificationBell from "@/components/dashboard/NotificationBell";
import FileUpload from "@/components/FileUpload";
import Notifications from "@/components/Notification";
import TestStripe from "@/components/TestStripe";
import { Button } from "@/components/ui/button";
import React from "react";

const Page = () => {
  const handleSendNotification = async () => {
    const fcmToken =
      "fIMQR3O3UKeGbXCiT66_n4:APA91bEcK2EAsJVONoQsNQUWxjZ3O7DtpuHVO8sBKxq6qiH7KI1humUqJsJtJxdt0jRf1YvM3xnPUEmwHMMYxyzoHRS7fO3-yNWR89_frXw8pCNb2G1zP-U";

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
      <Button onClick={handleSendNotification}>Send Notification</Button>

      <NotificationBell />

      {/* <h2>FOR TEST CHAT</h2>
      <Chat
        disputeId="679cdbfe2f341c830d8db667"
        userId="6793b68111fd2aa4ec2de91e"
      /> */}

      {/* <h2>FOR TEST Strip connect account</h2>
      <TestStripe /> */}

      <h2>For upload File on S3 </h2>
      <FileUpload />
    </div>
  );
};

export default Page;
