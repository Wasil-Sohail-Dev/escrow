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
} from "lucide-react";
import Link from "next/link";
import Loader from "@/components/ui/loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface DashboardStats {
  revenue: {
    total: number;
    currentMonth: number;
    growth: number;
  };
  projects: {
    total: number;
    distribution: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    newThisMonth: number;
  };
  users: {
    total: number;
    active: number;
    clients: number;
    vendors: number;
    newThisMonth: number;
    trends: { name: string; clients: number; vendors: number }[];
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
  admins: {
    active: number;
    inactive: number;
  };
}

const COLORS = {
  primary: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: '#6B7280'
};

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

  // Remove static data and use API data
  const userTrendData = stats?.users.trends || [];

  // Remove the static projectDistributionData
  const projectDistributionData = stats?.projects.distribution || [];

  const disputeData = [
    { name: 'Active', value: stats?.disputes.active || 0 },
    { name: 'Resolved', value: stats?.disputes.resolved || 0 },
  ];

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
            {stats?.projects.distribution.find(p => p.name === 'Active')?.value || 0}
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

      {/* User Statistics with Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border lg:col-span-2">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            User Growth Trend
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userTrendData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="vendors"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  dot={{ fill: COLORS.success }}
                  activeDot={{ r: 6 }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            User Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Clients', value: stats?.users.clients || 0 },
                    { name: 'Vendors', value: stats?.users.vendors || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill={COLORS.primary}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS.primary} />
                  <Cell fill={COLORS.success} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Total Users</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.users.total}
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
      </div>

      {/* Project and Dispute Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            Dispute Resolution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={disputeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill={COLORS.primary}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS.warning} />
                  <Cell fill={COLORS.success} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Resolution Rate</span>
              <span className="text-base-medium text-success-text">
                {stats?.disputes.resolutionRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border lg:col-span-2">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            Project Overview
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDistributionData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
                  {projectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Total Projects</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {stats?.projects.total}
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
      </div>

      {/* Admin and Verification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Admin Stats */}
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border lg:col-span-2">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            Admin Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Active',
                    value: stats?.admins?.active || 0,
                    color: COLORS.success
                  },
                  {
                    name: 'Inactive',
                    value: stats?.admins?.inactive || 0,
                    color: COLORS.error
                  }
                ]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Bar dataKey="value" fill={COLORS.primary}>
                  {[COLORS.success, COLORS.error].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Total Admins</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {(stats?.admins?.active || 0) + (stats?.admins?.inactive || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Active Rate</span>
              <span className="text-base-medium text-success-text">
                {Math.round((stats?.admins?.active || 0) / ((stats?.admins?.active || 0) + (stats?.admins?.inactive || 0)) * 100 || 0)}%
              </span>
            </div>
          </div>
        </div>
        {/* KYC Verification Stats */}
        <div className="bg-white dark:bg-dark-input-bg p-6 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h2 className="text-xl font-semibold text-main-heading dark:text-dark-text mb-4">
            KYC Verification Status
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: stats?.kyc.pending || 0, color: COLORS.warning },
                    { name: 'Approved', value: stats?.kyc.approved || 0, color: COLORS.success },
                    { name: 'Rejected', value: stats?.kyc.rejected || 0, color: COLORS.error }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill={COLORS.primary}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[COLORS.warning, COLORS.success, COLORS.error].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Total Verifications</span>
              <span className="text-base-medium text-paragraph dark:text-dark-text">
                {(stats?.kyc.pending || 0) + (stats?.kyc.approved || 0) + (stats?.kyc.rejected || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-2 dark:text-dark-text/60">Pending Review</span>
              <span className="text-base-medium text-warning dark:text-dark-text">
                {stats?.kyc.pending || 0}
              </span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default DashboardPage;
