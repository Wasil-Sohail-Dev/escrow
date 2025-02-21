import { Bell, ChevronDown, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Moon, Sun, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useNotification } from "@/contexts/NotificationProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/helpers/fromatDate";
import Loader from "../ui/loader";


export default function Topbar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const { user } = useUser();
  const { notifications, setNotifications, markAsRead } = useNotification();

  const formatTitle = (title: string) => {
    const words = title.split(" ");
    if (words.length > 2) {
      return words.slice(0, 2).join(" ");
    }
    return title;
  };

  const fetchNotifications = async () => {
    if (!user?._id) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/fetch-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          receiverId: user._id,
          status: "unread",
          limit: 4
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch notifications');
      }

      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        console.error("Failed to fetch notifications:", data.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user?._id]);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    fetchNotifications(); 
  };

  return (
    <div className="fixed top-0 right-0 md:left-[100px] left-0 z-40 bg-white dark:bg-dark-bg">
      <nav className="px-10 py-4 max-lg:px-8 max-md:px-4 bg-white dark:bg-dark-bg border-b border-[#6767670A] dark:border-dark-border">
        <div className="flex items-center justify-between gap-4">
          <div className="block lg:hidden md:hidden w-[20px] h-[20px] rounded-full" />
          <div className="flex flex-col gap-2 max-md:ml-8 flex-1">
            <div className="flex items-center md:gap-2 gap-1 flex-wrap">
              <h2 className="text-primary font-bold text-lg">Third Party</h2>
              <span className="text-gray-400 dark:text-dark-text/60">|</span>
              <h2 className="text-main-heading dark:text-dark-text text-[26px] font-bold leading-[33px] lg:text-[26px] md:text-[24px] max-md:text-[18px]">
               <span className="lg:hidden inline text-sm">{formatTitle(title)}</span> 
               <span className="hidden lg:inline">{title}</span>
              </h2>
            </div>
            <p className="text-body-normal text-[#64748B] dark:text-dark-text/60 lg:text-body-normal md:text-base-regular max-md:hidden">
              {description}
            </p>
          </div>
          <div className="flex items-center lg:gap-8 md:gap-6 max-md:gap-4">
            <div className="relative">
              <DropdownMenu onOpenChange={(open) => {
                if (open) {
                  fetchNotifications();
                }
              }}>
                <DropdownMenuTrigger className="outline-none">
                  <div className="relative mt-2">
                    <Bell
                      className="lg:w-6 lg:h-6 md:w-5 md:h-5 max-md:w-5 max-md:h-5 
                      text-muted-foreground dark:text-dark-text cursor-pointer"
                    />
                    {notifications.length > 0 && (
                      <div
                      className="absolute top-0 right-0 
                      lg:w-2 lg:h-2 md:w-1.5 md:h-1.5 max-md:w-1.5 max-md:h-1.5 
                      bg-[#ED4F9D] rounded-full"
                    />
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[400px] dark:bg-dark-bg dark:border-dark-border"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg dark:text-dark-text">
                        Notifications
                      </h3>
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                        onClick={() => router.push("/notifications")}
                      >
                        See All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {loading ? (
                        <Loader text="Loading notifications..." />
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-dark-input-bg rounded-lg cursor-pointer"
                            onClick={() => handleNotificationClick(notification._id || "")}
                          >
                            <div className="flex-shrink-0 flex items-center justify-center rounded-lg w-10 h-10 mt-1 bg-gray-100 dark:bg-dark-input-bg">
                              <Image
                                src="/assets/notificationicon4.svg"
                                alt="notification"
                                width={20}
                                height={20}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-medium dark:text-dark-text truncate max-w-[250px]">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-dark-text/60 flex-shrink-0">
                                  {formatDate((notification?.createdAt||""), true)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-dark-text/80 mt-1 line-clamp-2 break-words">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 dark:text-dark-text/60 py-4">No notifications</p>
                      )}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="rounded-full bg-secondary dark:bg-dark-text/10
                lg:h-8 lg:w-8 md:h-7 md:w-7 max-md:h-6 max-md:w-6"
              />
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <ChevronDown
                    size={20}
                    className="text-muted-foreground dark:text-dark-text"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[200px] dark:bg-dark-bg dark:border-dark-border"
                >
                  <Link href="/settings">
                    <DropdownMenuItem className="gap-2 cursor-pointer text-subtle-medium dark:text-dark-text dark:hover:bg-white/5">
                      <Settings size={14} />
                      Profile Settings
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dispute-management-screen">
                    <DropdownMenuItem className="gap-2 cursor-pointer text-subtle-medium dark:text-dark-text dark:hover:bg-white/5">
                      <HelpCircle size={14} />
                      Dispute
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/change-password">
                    <DropdownMenuItem className="gap-2 cursor-pointer text-subtle-medium dark:text-dark-text dark:hover:bg-white/5">
                      <Key size={14} />
                      Change Password
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-subtle-medium dark:text-dark-text dark:hover:bg-white/5"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
