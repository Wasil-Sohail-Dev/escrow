"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/helpers/fromatDate";

interface NotificationProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationProps) => {
  return (
    <div
      key={notification._id}
      className={`flex items-start gap-4 p-4 border-b border-[#E8EAEE] dark:border-dark-border
        hover:bg-white-2 dark:hover:bg-dark-input-bg transition-colors cursor-pointer`}
      onClick={() => onMarkAsRead(notification._id)}
    >
      <div className="flex items-center justify-center rounded-lg w-12 h-12 bg-gray-200">
        <Image
          src="/assets/notificationicon4.svg"
          alt="icon"
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
            {notification.status === "unread" ? (
              <span className="text-sm font-bold text-red-500">NEW</span>
            ) : (
              <span className="text-[14px] text-dark-2">
                {formatDate(notification.createdAt, true)}
              </span>
            )}
          </div>
        </div>

        <p className="text-[14px] text-dark-2 mt-1">{notification.message}</p>

        {/* {notification.type === "user" && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="secondary"
              className="text-base-medium text-white rounded-[12px]"
            >
              Decline
            </Button>
            <Button className="text-base-medium text-white rounded-[12px]">
              Accept
            </Button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default NotificationItem;
