"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  DollarSign,
  FileText,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Loader from "@/components/ui/loader";

interface DashboardStats {
  revenue: {
    total: number;
    currentMonth: number;
    growth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    newThisMonth: number;
  };
  users: {
    total: number;
    active: number;
    clients: number;
    vendors: number;
    newThisMonth: number;
  };
  disputes: {
    active: number;
    resolved: number;
    resolutionRate: number;
  };
  kyc: {
    pending: number;
    approved: number;
    rejected: number;
  };
  systemHealth: {
    status: string;
    uptime: number;
    services: {
      payments: string;
      escrow: string;
      authentication: string;
    };
  };
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/get-dashboard-stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader size="lg" text="Loading dashboard stats..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <span className={`text-sm font-medium ${(stats?.revenue?.growth ?? 0) >= 0 ? 'text-success-text' : 'text-error-text'}`}>
              {(stats?.revenue?.growth ?? 0) >= 0 ? '+' : ''}{stats?.revenue?.growth ?? 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-main-heading dark:text-dark-text mb-1">
            ${stats?.revenue.total.toLocaleString()}
          </h3>
          <p className="text-sm text-dark-2 dark:text-dark-text/60">Total Revenue</p>
        </div>

        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            <Link href="/dashboard/projects" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-main-heading dark:text-dark-text mb-1">
            {stats?.projects.active}
          </h3>
          <p className="text-sm text-dark-2 dark:text-dark-text/60">Active Projects</p>
        </div>

        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success-bg rounded-lg">
              <Users className="w-6 h-6 text-success-text" />
            </div>
            <Link href="/dashboard/users/clients" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-main-heading dark:text-dark-text mb-1">
            {stats?.users.total}
          </h3>
          <p className="text-sm text-dark-2 dark:text-dark-text/60">Total Users</p>
        </div>

        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-error-bg rounded-lg">
              <AlertTriangle className="w-6 h-6 text-error-text" />
            </div>
            <Link href="/dashboard/disputes" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-main-heading dark:text-dark-text mb-1">
            {stats?.disputes.active}
          </h3>
          <p className="text-sm text-dark-2 dark:text-dark-text/60">Active Disputes</p>
        </div>
      </div>

      {/* Quick Actions and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            Pending Actions
          </h2>
          <div className="space-y-4">
            {(stats?.kyc?.pending ?? 0) > 0 && (
              <div className="flex items-center justify-between p-4 bg-white-2 dark:bg-dark-input-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-error-accent"></div>
                  <div>
                    <p className="text-base-medium text-paragraph dark:text-dark-text">
                      KYC Verifications
                    </p>
                    <p className="text-sm text-dark-2 dark:text-dark-text/60">
                      {stats?.kyc?.pending ?? 0} pending verifications
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/verifications"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Review
                </Link>
              </div>
            )}

            {(stats?.disputes?.active ?? 0) > 0 && (
              <div className="flex items-center justify-between p-4 bg-white-2 dark:bg-dark-input-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-error-accent"></div>
                  <div>
                    <p className="text-base-medium text-paragraph dark:text-dark-text">
                      Active Disputes
                    </p>
                    <p className="text-sm text-dark-2 dark:text-dark-text/60">
                      {stats?.disputes?.active ?? 0} disputes need attention
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/disputes"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Resolve
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  Payment Processing
                </p>
                <span className="text-sm font-medium text-success-text flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Operational
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success-accent h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  Escrow Services
                </p>
                <span className="text-sm font-medium text-success-text flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Operational
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success-accent h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-base-medium text-paragraph dark:text-dark-text">
                  System Uptime
                </p>
                <span className="text-sm font-medium text-success-text flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {stats?.systemHealth.uptime}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success-accent h-2 rounded-full"
                  style={{ width: `${stats?.systemHealth.uptime}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Stats */}
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            User Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Total Users</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.users.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Active Users</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.users.active}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Clients</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.users.clients}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Vendors</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.users.vendors}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">New This Month</span>
              <span className="text-base-medium text-success-text">
                +{stats?.users.newThisMonth}
              </span>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            Project Overview
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Total Projects</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.projects.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Active Projects</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.projects.active}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Completed Projects</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.projects.completed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">New This Month</span>
              <span className="text-base-medium text-success-text">
                +{stats?.projects.newThisMonth}
              </span>
            </div>
          </div>
        </div>

        {/* Dispute Stats */}
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            Dispute Resolution
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Active Disputes</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.disputes.active}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Resolved Disputes</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.disputes.resolved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Resolution Rate</span>
              <span className="text-base-medium text-success-text">
                {stats?.disputes.resolutionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
