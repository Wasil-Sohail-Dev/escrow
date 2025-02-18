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
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(5, "Password must be at least 5 characters long"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const PasswordRequirement = ({ text, isMet }: { text: string; isMet: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isMet ? 'text-[#00BA88]' : 'text-gray-300'}`}>
      <Check className="w-3 h-3" />
    </div>
    <span className={`text-sm ${isMet ? 'text-[#00BA88]' : 'text-gray-400'}`}>
      {text}
    </span>
  </div>
);

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
  });
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

  const checkPasswordRequirements = (password: string) => {
    setShowRequirements(!!password);
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password),
    });
  };

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

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('input[name="newPassword"]')) {
      setShowRequirements(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className="relative flex justify-center w-full">
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

            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">New Password</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showNewPassword ? "text" : "password"}
                      className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text pr-10"
                      disabled={loading}
                       placeholder="••••••••"
                      onFocus={() => setShowRequirements(true)}
                      onChange={(e) => {
                        field.onChange(e);
                        checkPasswordRequirements(e.target.value);
                      }}
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
                  
                  {/* Password Requirements Modal */}
                  {showRequirements && (
                    <div className="absolute left-0 md:left-[105%] bottom-0 md:bottom-auto md:top-0 w-full md:w-72 translate-y-full md:translate-y-0 bg-white dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg p-4 shadow-lg z-10">
                      <div className="hidden md:block absolute left-0 top-4 -translate-x-2">
                        <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white dark:border-r-dark-input-bg"></div>
                      </div>
                      <div className="md:hidden absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2">
                        <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-dark-input-bg"></div>
                      </div>
                      <div className="space-y-2">
                        <PasswordRequirement
                          text="At least 8 characters"
                          isMet={passwordRequirements.minLength}
                        />
                        <PasswordRequirement
                          text="At least one lowercase letter"
                          isMet={passwordRequirements.hasLower}
                        />
                        <PasswordRequirement
                          text="At least one uppercase letter"
                          isMet={passwordRequirements.hasUpper}
                        />
                        <PasswordRequirement
                          text="At least one number"
                          isMet={passwordRequirements.hasNumber}
                        />
                        <PasswordRequirement
                          text="At least one special character"
                          isMet={passwordRequirements.hasSpecial}
                        />
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">Confirm Password</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text pr-10"
                      disabled={loading}
                      placeholder="••••••••"
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
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg mt-6"
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
    </div>
  );
};

export default Page; 