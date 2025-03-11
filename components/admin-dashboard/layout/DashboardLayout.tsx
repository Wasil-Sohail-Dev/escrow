"use client";

import { ReactNode, Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import Loader from "../../ui/loader";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  Handshake,
  Search,
  FolderClosed,
  Wallet,
  AlertTriangle,
  Bell,
  X,
  Menu
} from "lucide-react";
import { useAdmin } from "@/components/providers/AdminProvider";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  requiredPermission: string;
}

const mainNavItems: NavItem[] = [
  { 
    href: "/dashboard", 
    label: "Overview", 
    icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
    requiredPermission: "view_analytics"
  },
  { 
    href: "/dashboard/users/vendors", 
    label: "Vendors", 
    icon: <Users className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_users"
  },
  { 
    href: "/dashboard/users/clients", 
    label: "Clients", 
    icon: <Handshake className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_users"
  },
  { 
    href: "/dashboard/users/admins", 
    label: "Admins", 
    icon: <Users className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_admins"
  },
];

const transactionNavItems: NavItem[] = [
  { 
    href: "/dashboard/verifications", 
    label: "Verifications", 
    icon: <Search className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_users"
  },
  { 
    href: "/dashboard/projects", 
    label: "Projects", 
    icon: <FolderClosed className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_contracts"
  },
  { 
    href: "/dashboard/payments", 
    label: "Payments", 
    icon: <Wallet className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_payments"
  },
  { 
    href: "/dashboard/disputes", 
    label: "Disputes", 
    icon: <AlertTriangle className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_disputes"
  },
  { 
    href: "/dashboard/permotion-code", 
    label: "Promotion Code", 
    icon: <Wallet className="w-5 h-5 mr-2" />,
    requiredPermission: "manage_payments"
  },
];

interface NavSectionProps {
  title: string;
  items: NavItem[];
  currentPath: string;
  userPermissions: string[];
}

const NavSection = ({ title, items, currentPath, userPermissions }: NavSectionProps) => {
  // Filter items based on user permissions
  const hasAccess = (requiredPermission: string) => {
    return userPermissions.includes('all') || userPermissions.includes(requiredPermission);
  };

  const filteredItems = items.filter(item => hasAccess(item.requiredPermission));

  if (filteredItems.length === 0) return null;

  return (
    <>
      <div className="px-4 mt-8 mb-2">
        <p className="text-xs font-semibold text-dark-2 dark:text-dark-text uppercase">
          {title}
        </p>
      </div>
      <ul className="space-y-1">
        {filteredItems.map((item) => {
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
                <span>{item.icon}</span>
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
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDisputeChat = pathname.includes("/dashboard/dispute-chat");
  const { user } = useAdmin();

  // If user is not loaded or doesn't have permissions, show loading or return null
  if (!user || !user.permissions) {
    return <Loader size="lg" text="Loading..." />;
  }

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
        <div className="p-2 flex justify-between items-center w-full">
          <div className="w-full flex justify-center items-center">
            <Image
              src={"/assets/logo.png"}
              alt="logo" 
              width={118}
              height={118}
              className="mx-auto"
            />
          </div>
          <button
            className="lg:hidden text-dark-2 hover:text-primary absolute right-2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="-mt-8">
          <NavSection
            title="Main"
            items={mainNavItems}
            currentPath={pathname}
            userPermissions={user.permissions}
          />
          <NavSection
            title="Transactions"
            items={transactionNavItems}
            currentPath={pathname}
            userPermissions={user.permissions}
          />
          {/* <NavSection
            title="System"
            items={systemNavItems}
            currentPath={pathname}
          /> */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header
          className={`bg-white dark:bg-dark-bg border-b border-sidebar-border dark:border-dark-border ${
            isDisputeChat ? "absolute top-0 left-0 right-0" : ""
          }`}
        >
          <div className="flex justify-between items-center px-4 lg:px-6 py-4">
            <button
              className="lg:hidden text-paragraph dark:text-dark-text"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {!isDisputeChat&&<div className="flex items-center gap-2">
            <h2 className="text-primary font-bold text-lg">Third Party |</h2>
            <h2 className="text-main-heading dark:text-dark-text text-[26px] font-bold leading-[33px] lg:text-[26px] md:text-[24px] max-md:text-[18px]">
              Escrow Admin
            </h2>
            </div>}

            <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
              <button className="p-2 text-paragraph dark:text-dark-text hover:bg-primary-100 dark:hover:bg-dark-input-bg rounded-lg">
                <span className="sr-only">Notifications</span>
                <Bell className="w-6 h-6" />
              </button>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        <div
          className={`flex-1 overflow-auto  bg-white dark:bg-dark-bg ${
            isDisputeChat ? "" : "p-4 lg:p-6"
          }`}
        >
          <Suspense fallback={<Loader size="lg" text="Loading..." />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
