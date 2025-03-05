"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const ResetSuccess = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 py-10 border border-[#E8EAEE] dark:border-dark-border shadow-sm rounded-sm">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-paragraph dark:text-dark-text">
          Password reset successfully
        </h1>
      </div>

      <div className="flex justify-center py-8">
          <CheckCircle2 className="w-20 h-20 text-[#26BA7F]" />
      </div>

      <Link href="/sign-in" className="w-full">
        <Button 
          className="h-11 w-full bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          Login
        </Button>
      </Link>
    </div>
  );
};

export default ResetSuccess;