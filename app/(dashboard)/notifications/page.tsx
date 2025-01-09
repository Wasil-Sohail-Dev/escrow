"use client";

import React from "react";
import Topbar from "../components/Topbar";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  type: "update" | "friendly-tip" | "system" | "payment";
  title: string;
  message: string;
  timestamp: string;
  icon: string;
  iconBg: string;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: "update",
    title: "Update: New milestone completed!",
    message:
      "Exciting news! We've rolled out new features to enhance your experience. Log in to explore what's new!",
    timestamp: "Just now",
    icon: "/assets/notificationicon1.svg",
    iconBg: "bg-[#ABEFC6]",
  },
  {
    id: 2,
    type: "friendly-tip",
    title: "Friendly Tip: Optimize Your Workspace",
    message:
      "Just a heads-up that your rent payment is due soon. Please make sure to pay on time to avoid any late fees!",
    timestamp: "7 hours ago",
    icon: "/assets/notificationicon4.svg",
    iconBg: "bg-[#FEDF89]",
  },
  {
    id: 3,
    type: "system",
    title: "System Notification: Security Check Scheduled",
    message:
      "For your safety, a system security check is planned for Thursday at 2:00 PM. No action needed on your part; we'll handle everything!",
    timestamp: "Yesterday",
    icon: "/assets/notificationicon3.svg",
    iconBg: "bg-error-bg",
  },
  {
    id: 4,
    type: "payment",
    title: "Heads Up: New payment added to your account",
    message:
      "Project: Graphic designing payment just released to your account.",
    timestamp: "20 Sep",
    icon: "/assets/notificationicon4.svg",
    iconBg: "bg-[#FEDF89]",
  },
];

const NotificationsPage = () => {
  return (
    <>
      <Topbar
        title="Notifications"
        description="See all your updates and notifications here."
      />
      <div className="mt-[85px]">
        <div className="w-full">
          <div className="">
            <h1 className="text-[20px] lg:font-[700] lg:leading-[30px] mb-2 text-[#292929] dark:text-dark-text">
              Notifications
            </h1>
          </div>

          <div className="">
            {notifications.map((notification,index) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 p-4 border-b border-[#E8EAEE] dark:border-dark-border hover:bg-white-2 dark:hover:bg-dark-input-bg transition-colors cursor-pointer"
              >
                <div
                  className={`${notification.iconBg} flex items-center justify-center rounded-lg w-12 h-12`}
                >
                  <Image
                    src={notification.icon}
                    alt={notification.type}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex sm:flex-row flex-col justify-between items-start">
                    <h3 className="text-[16px] font-semibold text-paragraph dark:text-dark-text">
                      {notification.title}
                    </h3>
                    <div className="flex items-start gap-8">
                    {index===0&&<div className="flex gap-2">
              <Button variant="secondary" className="text-base-medium text-white rounded-[12px]">Decline</Button>
                <Button className="text-base-medium text-white rounded-[12px]">Accept</Button>
              </div>}
                    <span className="text-[14px] text-dark-2">
                      {notification.timestamp}
                    </span>
                    </div>
                  </div>
                  <p className="text-[14px] text-dark-2 mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
