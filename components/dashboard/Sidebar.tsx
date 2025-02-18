"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DashboardIcon from "@/components/icons/DasboardIcon";
import ContactDetailIcon from "@/components/icons/ContactDetailIcon";
import CreateContractIcon from "@/components/icons/CreateContractIcon";
import PaymentHistoryIcon from "@/components/icons/PaymentHistoryIcon";
import CreateDisputeIcon from "@/components/icons/CreateDisputeIcon";
import TermConditionIcon from "@/components/icons/TermConditionIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import HelpIcon from "@/components/icons/HelpIcon";
import SettingIcon from "@/components/icons/SettingIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { useUser } from "@/contexts/UserContext";
import LogoutConfirmationModal from "@/components/modals/LogoutConfirmationModal";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleMenuItemClick = () => {
    if (window.innerWidth < 768) {
      // Close only on mobile
      setIsOpen(false);
    }
  };

  const menuItems = [
    { path: "/home", label: "Dashboard", icon: DashboardIcon },
    { path: "/projects", label: "Projects", icon: ContactDetailIcon },
    ...(user?.userType === "client"
      ? [
          {
            path: "/create-contract",
            label: "Create Contract",
            icon: CreateContractIcon,
          },
        ]
      : []),
    {
      path: "/payment-history",
      label: "Payment History",
      icon: PaymentHistoryIcon,
    },
    {
      path: "/dispute-management-screen",
      label: "Dispute Management",
      icon: CreateDisputeIcon,
    },
    { path: "/dispute-chat", label: "Dispute Chat", icon: ChatIcon },
    { path: "/contact-us", label: "Contact Us", icon: HelpIcon },
    {
      path: "/terms-conditions",
      label: "Terms & Conditions",
      icon: TermConditionIcon,
    },
  ];

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <TooltipProvider>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-accent dark:bg-dark-bg ml-2"
      >
        {isOpen ? (
          // <X className="w-6 h-6 text-sidebar-icon text-sidebar-foreground dark:text-dark-icon" />
          <></>
        ) : (
          <Menu className="w-6 h-6 text-sidebar-icon text-sidebar-foreground dark:text-dark-icon" />
        )}
      </button>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />

      <aside
        className={`z-40 pt-2
          fixed md:relative h-screen overflow-y-auto scrollbar-hide
          w-[118px] md:w-[120px] max-md:w-[240px] bg-sidebar dark:bg-dark-bg border-r border-sidebar-border dark:border-dark-border
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          transition-transform duration-300
        `}
        onClick={handleMenuClick}
      >
        <div className="flex flex-col min-h-full">
          <div className="flex-shrink-0 flex justify-center">
            <Link
              href={"/home"}
              className="flex items-center justify-center"
              onClick={handleMenuItemClick}
            >
              <Image
                src={"/assets/logo.png"}
                alt="logo"
                width={118}
                height={118}
                className={""}
              />
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center gap-6 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // const isActive = pathname.includes(item.path);
              const isActive =
                item.path === "/home"
                  ? pathname === "/home" ||
                    pathname.includes("/milestone-details")
                  : item.path === "/projects"
                  ? pathname.includes("/projects") ||
                    pathname.includes("/contact-details") ||
                    pathname.includes("/make-payment") ||
                    pathname.includes("/transection-details")
                  : item.path === "/create-contract"
                  ? pathname === "/create-contract" ||
                    pathname === "/pre-built-contracts" ||
                    pathname === "/pre-built-details"
                  : item.path === "/dispute-management-screen"
                  ? pathname.includes("/dispute-management-screen") ||
                    pathname.includes("/create-dispute")
                  : pathname.includes(item.path);

              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.path}
                      className="w-full p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors flex md:justify-center items-center gap-3"
                      onClick={handleMenuItemClick}
                    >
                      <Icon
                        className={`w-7 h-7 flex-shrink-0 ${
                          isActive
                            ? "text-primary"
                            : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                        }`}
                      />
                      <span
                        className={`md:hidden text-sm ${
                          isActive
                            ? "text-primary"
                            : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                        } `}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{item.label}</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className="w-full p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors flex md:justify-center items-center gap-3"
                  onClick={handleMenuItemClick}
                >
                  <SettingIcon
                    className={`w-7 h-7 flex-shrink-0 ${
                      pathname === "/settings"
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                  <span className="md:hidden text-sm text-sidebar-foreground dark:text-dark-text">
                    Settings
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="w-full p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors flex md:justify-center items-center gap-3 cursor-pointer"
                  onClick={(e) => {
                    handleLogoutClick();
                    handleMenuItemClick();
                  }}
                >
                  <LogoutIcon className="w-7 h-7 flex-shrink-0 text-sidebar-icon text-sidebar-foreground dark:text-dark-icon" />
                  <span className="md:hidden text-sm text-sidebar-foreground dark:text-dark-text">
                    Logout
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Logout</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
