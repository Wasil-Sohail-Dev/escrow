"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "./providers/AdminProvider";
import { toast } from "@/hooks/use-toast";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading } = useAdmin();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin-auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to logout');
      }

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Redirect to login page
      router.push('/admin-login');
      router.refresh(); // Refresh to clear any cached data
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          {user?.firstName?.[0] || 'A'}
        </div>
        <div className="text-sm">
          <p className="font-medium text-paragraph dark:text-dark-text">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-dark-2">{user?.email}</p>
        </div>
        <svg
          className={`w-4 h-4 text-dark-2 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg rounded-lg shadow-lg border border-sidebar-border dark:border-dark-border py-1">
          <div className="px-4 py-3 border-b border-sidebar-border dark:border-dark-border">
            <p className="text-sm font-medium text-paragraph dark:text-dark-text">
              {user?.userType === 'super_admin' ? 'Super Admin' : user?.userType}
            </p>
            <p className="text-xs text-dark-2">{user?.email}</p>
          </div>

          <a
            href="/dashboard/settings"
            className="block px-4 py-2 text-sm text-paragraph dark:text-dark-text hover:bg-primary-100 dark:hover:bg-dark-input-bg"
          >
            Settings
          </a>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 text-sm text-error-text hover:bg-error-bg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-error-text border-t-transparent rounded-full animate-spin mr-2"></span>
                Signing out...
              </>
            ) : (
              'Sign out'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
