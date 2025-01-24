"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import NotificationsIcon from "@/components/icons/NotificationsIcon";
import CreateDisputeIcon from "@/components/icons/CreateDisputeIcon";
import TermConditionIcon from "@/components/icons/TermConditionIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import SettingIcon from "@/components/icons/SettingIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { signOut } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import LogoutConfirmationModal from "@/components/modals/LogoutConfirmationModal";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <TooltipProvider>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-accent dark:bg-dark-bg ml-2"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-sidebar-icon text-sidebar-foreground dark:text-dark-icon" />
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
        className={`z-40 pt-16 md:pt-2
          fixed md:relative h-screen overflow-y-auto scrollbar-hide
          w-[118px] bg-sidebar dark:bg-dark-bg border-r border-sidebar-border dark:border-dark-border
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          transition-transform duration-300
        `}
      >
        <div className="flex flex-col min-h-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex-shrink-0">
            <Link href={"/home"} className="flex items-center">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/home"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <DashboardIcon className={`w-7 h-7 ${
                    pathname.includes("/home") ||
                    pathname.includes("/milestone-details")
                      ? "text-primary"
                      : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                  }`} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <span>Dashboard</span>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/projects"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ContactDetailIcon className={`w-7 h-7 ${
                    pathname.includes("/projects") || pathname.includes("/contact-details") || pathname.includes("/make-payment") ||
                    pathname === "/transection-details" ||
                    pathname === "/make-payment" ||
                    pathname.includes("/transection-details")
                      ? "text-primary"
                      : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                  }`} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Projects</TooltipContent>
            </Tooltip>
            {user?.userType === "client" && <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/create-contract"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <CreateContractIcon
                    className={`w-8 h-8 ${
                      pathname === "/create-contract" ||
                      pathname === "/pre-build-contracts" ||
                      pathname === "/pre-build-details"
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Create Contract</TooltipContent>
            </Tooltip>}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/payment-history"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <PaymentHistoryIcon
                    className={`w-7 h-7 ${
                      pathname === "/payment-history"
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Payment History</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/notifications"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <NotificationsIcon
                    className={`w-6 h-6 ${
                      pathname === "/notifications"
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dispute-management-screen"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <CreateDisputeIcon
                    className={`w-7 h-7 ${
                      pathname.includes("/dispute-management-screen") ||
                      pathname.includes("/create-dispute")
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Dispute Management</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dispute-chat"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChatIcon
                    className={`w-7 h-7 ${
                      pathname === "/dispute-chat"
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Dispute Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/contact-us"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChatIcon
                    className={`w-7 h-7 ${
                      pathname === "/contact-us"
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Contact Us</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/terms-conditions"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <TermConditionIcon
                    className={`w-7 h-7 ${
                      pathname.includes("/terms-conditions")
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Terms & Conditions</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-7 pb-7">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <SettingIcon
                    className={`w-7 h-7 ${
                      pathname === "/settings"
                        ? "text-primary"
                        : "text-sidebar-icon text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="cursor-pointer p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors" 
                  onClick={handleLogoutClick}
                >
                  <LogoutIcon className="w-7 h-7 text-sidebar-icon text-sidebar-foreground dark:text-dark-icon" />
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
