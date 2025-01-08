"use client";

import { useState } from "react";
import Image from "next/image";
import { Banknote, File, FileTerminal, Menu, SquarePen, X } from "lucide-react";
import {
  Settings,
  MessageSquare,
  Bell,
  LogOut,
  LayoutDashboard,
  Contact,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-accent dark:bg-dark-bg ml-2"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-sidebar-foreground dark:text-dark-icon" />
        ) : (
          <Menu className="w-6 h-6 text-sidebar-foreground dark:text-dark-icon" />
        )}
      </button>
      <aside
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
            <Link
              href="/home"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <LayoutDashboard
                className={`w-6 h-6 ${
                  pathname.includes("/home") ||
                  pathname.includes("/milestone-details")
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/contact-details"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Contact
                className={`w-6 h-6 ${
                  pathname === "/contact-details" ||
                  pathname === "/transection-details" ||
                  pathname === "/make-payment"
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/create-contract"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <SquarePen
                className={`w-6 h-6 ${
                  pathname === "/create-contract" ||
                  pathname === "/pre-build-contracts" ||
                  pathname === "/pre-build-details"
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/payment-history"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Banknote
                className={`w-6 h-6 ${
                  pathname === "/payment-history"
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/notifications"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell
                className={`w-6 h-6 ${
                  pathname === "/notifications"
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/dispute-management-screen"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <File
                className={`w-6 h-6 ${
                  pathname.includes("/dispute-management-screen") ||
                  pathname.includes("/create-dispute")
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/contact-us"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <MessageSquare
                className={`w-6 h-6 ${
                  pathname === "/contact-us"
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/terms-conditions"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <FileTerminal
                className={`w-6 h-6 ${
                  pathname.includes("/terms-conditions")
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-6 pb-6">
            <Link
              href="/settings"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings
                className={`w-6 h-6 ${
                  pathname === "/settings"
                    ? "text-primary"
                    : "text-sidebar-foreground dark:text-dark-icon"
                }`}
              />
            </Link>
            <Link
              href="/logout"
              className="p-3 hover:bg-sidebar-accent dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-6 h-6 text-sidebar-foreground dark:text-dark-icon" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
