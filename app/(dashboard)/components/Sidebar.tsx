"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-accent dark:bg-dark-bg ml-2"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#CACED8] text-sidebar-foreground dark:text-dark-icon" />
        ) : (
          <Menu className="w-6 h-6 text-[#CACED8] text-sidebar-foreground dark:text-dark-icon" />
        )}
      </button>
      <aside
        onClick={() => setIsOpen(!isOpen)}
        className={`z-40 pt-16 md:pt-2
          fixed md:relative h-screen overflow-y-auto scrollbar-hide
          w-[118px] bg-sidebar dark:bg-dark-bg border-r border-sidebar-border dark:border-dark-border
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          transition-transform duration-300
        `}
      >
        <div className="flex flex-col min-h-full">
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
                      : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                  }`} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Dashboard
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/contact-details"
                  className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ContactDetailIcon className={`w-7 h-7 ${
                    pathname === "/contact-details" ||
                    pathname === "/transection-details" ||
                    pathname === "/make-payment"
                      ? "text-primary"
                      : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                  }`} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Contact Details
              </TooltipContent>
            </Tooltip>

            <Tooltip>
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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Create Contract
              </TooltipContent>
            </Tooltip>

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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Payment History
              </TooltipContent>
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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Notifications
              </TooltipContent>
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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Dispute Management
              </TooltipContent>
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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Dispute Chat
              </TooltipContent>
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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Contact Us
              </TooltipContent>
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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Terms & Conditions
              </TooltipContent>
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
                        : "text-[#CACED8] text-sidebar-foreground dark:text-dark-icon"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Settings
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors">
                  <LogoutIcon className="w-7 h-7 text-[#CACED8] text-sidebar-foreground dark:text-dark-icon" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Logout
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
