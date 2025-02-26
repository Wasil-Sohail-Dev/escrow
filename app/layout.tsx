import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster as ShadCNToaster } from "@/components/ui/toaster"; // ✅ For API toast messages
import { Toaster as SonnerToaster } from "sonner"; // ✅ For FCM notifications
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Third Party Escrow",
  description: "Secure contract management and payment processing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>{children}</AppProviders>

          {/* ✅ ShadCN Toaster (For API Responses) */}
          <ShadCNToaster />

          {/* ✅ Sonner Toaster (For Real-Time Notifications) */}
          <SonnerToaster position="top-right" expand richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
