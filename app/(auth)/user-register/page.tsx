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

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

// Validation Schema
const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
    cnfPassword: z
      .string()
      .min(8, "Passwords don't match"),
    acceptPolicy: z.boolean()
      .refine((val) => val === true, {
        message: "Please accept the Terms and Conditions to proceed."
      }),
  })
  .refine((data) => data.password === data.cnfPassword, {
    message: "Passwords don't match",
    path: ["cnfPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      cnfPassword: "",
      acceptPolicy: false,
    },
    mode: "onBlur",
  });

  const handleSignUp = async (data: SignUpFormValues) => {
    if (!data.acceptPolicy) {
      toast({
        title: "Warning",
        description: "Please check the policy to proceed.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      // Store form data in localStorage temporarily
      localStorage.setItem("tempRegisterData", JSON.stringify({
        email: data.email,
        password: data.password
      }));
      
      // Redirect to user type selection
      router.push("/select-usertype");
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 my-12 border border-[#E8EAEE] dark:border-dark-border">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">Create Account</h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Fill in your details to get started
        </p>
      </div>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignUp)}
          className="flex flex-col gap-4"
        >
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Email
                </FormLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  disabled={loading}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Password
                </FormLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pr-10 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-text"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="cnfPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Confirm Password
                </FormLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pr-10 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
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

          {/* Accept Policy Checkbox */}
          <FormField
            control={form.control}
            name="acceptPolicy"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                    className="border-[#D1D5DB] dark:border-dark-border data-[state=checked]:bg-primary"
                  />
                  <label className="text-sm text-paragraph dark:text-dark-text">
                    I agree to the terms and conditions
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="h-11 bg-primary hover:bg-primary/90 text-white dark:text-dark-text rounded-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Next Step...</span>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form><p className="text-sm text-paragraph dark:text-dark-text text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Page;
