"use client";

import { ReactNode, Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import Loader from "../../ui/loader";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/users/vendors", label: "Vendors", icon: "👥" },
  { href: "/dashboard/users/clients", label: "Clients", icon: "🤝" },
];

const transactionNavItems: NavItem[] = [
  { href: "/dashboard/verifications", label: "Verifications", icon: "🔍" },
  { href: "/dashboard/projects", label: "Projects", icon: "📁" },
  { href: "/dashboard/payments", label: "Payments", icon: "💰" },
  { href: "/dashboard/disputes", label: "Disputes", icon: "⚠️" },
];

const systemNavItems: NavItem[] = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: "📝" },
];

interface NavSectionProps {
  title: string;
  items: NavItem[];
  currentPath: string;
}

const NavSection = ({ title, items, currentPath }: NavSectionProps) => (
  <>
    <div className="px-4 mt-8 mb-2">
      <p className="text-xs font-semibold text-dark-2 dark:text-dark-text uppercase">
        {title}
      </p>
    </div>
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-2 text-base-medium ${
                isActive
                  ? "bg-primary text-white dark:text-dark-text"
                  : "text-paragraph dark:text-dark-text hover:bg-primary-100 dark:hover:bg-dark-input-bg"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-error-bg text-error-text">
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  </>
);

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-white-1 dark:bg-dark-bg">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-dark-bg border-r border-sidebar-border dark:border-dark-border
        transform transition-transform duration-200 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-heading3-bold text-main-heading dark:text-dark-text">
            Escrow Admin
          </h1>
          <button
            className="lg:hidden text-dark-2 hover:text-primary"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="mt-8">
          <NavSection
            title="Main"
            items={mainNavItems}
            currentPath={pathname}
          />
          <NavSection
            title="Transactions"
            items={transactionNavItems}
            currentPath={pathname}
          />
          <NavSection
            title="System"
            items={systemNavItems}
            currentPath={pathname}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white dark:bg-dark-bg border-b border-sidebar-border dark:border-dark-border">
          <div className="flex justify-between items-center px-4 lg:px-6 py-4">
            <button
              className="lg:hidden text-paragraph dark:text-dark-text"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>

            <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
              <button className="p-2 text-paragraph dark:text-dark-text hover:bg-primary-100 dark:hover:bg-dark-input-bg rounded-lg">
                <span className="sr-only">Notifications</span>
                🔔
              </button>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-6 bg-white dark:bg-dark-bg">
          <Suspense fallback={<Loader size="lg" text="Loading..." />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
