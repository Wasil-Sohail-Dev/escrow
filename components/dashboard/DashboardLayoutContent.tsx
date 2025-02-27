"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Loader from "@/components/ui/loader";
import { Suspense, useState } from "react";

export default function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDisputeChat = pathname.includes("/dispute-chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleClickOutside = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-white dark:bg-dark-bg" onClick={handleClickOutside}>
      <div className="fixed left-0 top-0 z-50">
        <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      </div>
      <section className="flex-1 md:ml-[118px] ml-0 min-h-screen">
        <main
          className={!isDisputeChat ? `px-20 py-10
          lg:px-10 lg:py-10 
          md:px-6 md:py-8 
          max-md:px-4 max-md:py-4` : ""}
        >
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-screen">
                <Loader size="lg" text="Loading..." />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </section>
    </section>
  );
} 