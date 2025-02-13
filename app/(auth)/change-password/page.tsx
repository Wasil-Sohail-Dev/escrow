"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(5, "Password must be at least 5 characters long"),
  newPassword: z.string().min(5, "Password must be at least 5 characters long"),
  confirmPassword: z.string().min(5, "Password must be at least 5 characters long"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleChangePassword = async (data: ChangePasswordFormValues) => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      router.push("/home");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 border border-[#E8EAEE] dark:border-dark-border shadow-sm rounded-sm">
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">
          Change Password
        </h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Please enter your current password and new password.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleChangePassword)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Current Password
                </FormLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type={showOldPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-text"
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  New Password
                </FormLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-text"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Confirm New Password
                </FormLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-text"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-11 bg-primary hover:bg-primary/90 text-white rounded-lg mt-4"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Page; 