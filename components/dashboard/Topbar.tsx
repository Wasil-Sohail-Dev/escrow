import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Moon, Sun, LogOut, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Latest notifications data
const latestNotifications = [
  {
    id: 1,
    type: "update",
    title: "Update: New milestone completed!",
    message: "Exciting news! We've rolled out new features to enhance your experience.",
    timestamp: "Just now",
    icon: "/assets/notificationicon1.svg",
    iconBg: "bg-[#ABEFC6]",
  },
  {
    id: 2,
    type: "friendly-tip",
    title: "Friendly Tip: Optimize Your Workspace",
    message: "Just a heads-up that your rent payment is due soon.",
    timestamp: "7 hours ago",
    icon: "/assets/notificationicon4.svg",
    iconBg: "bg-[#FEDF89]",
  },
  {
    id: 3,
    type: "system",
    title: "System Notification",
    message: "For your safety, a system security check is planned.",
    timestamp: "Yesterday",
    icon: "/assets/notificationicon3.svg",
    iconBg: "bg-error-bg",
  },
];

export default function Topbar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const { user, loading } = useUser();

  return (
    <div className="fixed top-0 right-0 md:left-[118px] left-0 z-40 bg-white dark:bg-dark-bg border-b border-[#6767670A] dark:border-dark-border">
      <nav className="px-10 py-4 max-lg:px-8 max-md:px-4 bg-white dark:bg-dark-bg border-b border-[#6767670A] dark:border-dark-border">
        <div className="flex items-center justify-between gap-4">
          <div className="block lg:hidden md:hidden w-[20px] h-[20px] rounded-full" />
          <div className="flex flex-col gap-2">
            <h2
              className="text-main-heading dark:text-dark-text text-[26px] font-bold leading-[33px] 
            lg:text-[26px] md:text-[24px] max-md:text-[20px]"
            >
              {title}
            </h2>
            <p
              className="text-body-normal text-[#64748B] dark:text-dark-text/60
            lg:text-body-normal md:text-base-regular max-md:hidden"
            >
              {description}
            </p>
          </div>
          <div className="flex items-center lg:gap-8 md:gap-6 max-md:gap-4">
            {/* {(title === "Overview" ||
              title === "Dispute Management screen") && (
              <div
                className="flex items-center gap-2 border dark:border-dark-text px-2 rounded
            lg:flex md:flex max-md:hidden"
              >
                <Search className="w-4 h-4 text-muted-foreground dark:text-dark-text bg-none" />
                <Input
                  placeholder="Search by ID"
                  className="w-[300px] h-[52px] border-none bg-transparent dark:text-dark-text
                lg:w-[300px] md:w-[200px] 
                lg:h-[52px] md:h-[45px]"
                />
              </div>
            )} */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="relative">
                    <Bell
                      className="lg:w-6 lg:h-6 md:w-5 md:h-5 max-md:w-5 max-md:h-5 
                      text-muted-foreground dark:text-dark-text cursor-pointer"
                    />
                    <div
                      className="absolute top-0 right-0 
                      lg:w-2 lg:h-2 md:w-1.5 md:h-1.5 max-md:w-1.5 max-md:h-1.5 
                      bg-[#ED4F9D] rounded-full"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[400px] dark:bg-dark-bg dark:border-dark-border"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg dark:text-dark-text">Notifications</h3>
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                        onClick={() => router.push('/notifications')}
                      >
                        See All
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {latestNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-dark-input-bg rounded-lg cursor-pointer"
                        >
                          <div
                            className={`${notification.iconBg} flex-shrink-0 flex items-center justify-center rounded-lg w-10 h-10`}
                          >
                            <Image
                              src={notification.icon}
                              alt={notification.type}
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
                                {notification.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-dark-text/80 mt-1 line-clamp-2 break-words">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      ))}
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
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-subtle-medium dark:text-dark-text dark:hover:bg-white/5"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer text-subtle-medium dark:text-dark-text dark:hover:bg-white/5 border-t dark:border-dark-text/10">
                    <LogOut size={14} />
                    Log Out
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
