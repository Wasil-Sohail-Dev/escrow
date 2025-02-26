import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "@/components/admin-dashboard/layout/DashboardLayout";
import { AdminProvider, useAdmin } from "@/components/providers/AdminProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Escrow Admin Dashboard",
  description: "Secure contract management and payment processing platform",
};


export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AdminProvider>
        <div className={inter.className}>
            <DashboardLayout>
              <div className="min-h-screen bg-background">
                {children}
              </div>
            </DashboardLayout>
        </div>
      </AdminProvider>
    </ThemeProvider>
  );
}
