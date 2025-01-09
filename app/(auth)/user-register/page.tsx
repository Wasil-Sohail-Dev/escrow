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
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character"
      ),
    cnfPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long"),
    userType: z.string().nonempty("Please select a role (Client or Vendor)"),
    acceptPolicy: z.literal(true, {
      errorMap: () => ({ message: "You must accept the policy to continue." }),
    }),
  })
  .refine((data) => data.password === data.cnfPassword, {
    message: "Passwords don't match",
    path: ["cnfPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const Page = () => {
  const [loading, setLoading] = useState(false);

  // localStorage.removeItem("TpAuthToken");

  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      cnfPassword: "",
      userType: "vendor",
      acceptPolicy: true,
    },
    mode: "onBlur",
  });

  const router = useRouter();

  const handleSignUp = async (data: SignUpFormValues) => {
    if (!data.acceptPolicy) {
      toast({
        title: "Warning",
        description: "Please check the policy to proceed.",
        variant: "warning",
      });
      return; // Prevent submission if the policy is not accepted
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/register", data);


      if (response.status === 201) {
        toast({
          title: "Success",
          description:
            response.data.message ||
            "Registration successful! Please check your email.",
          variant: "default",
        });

        localStorage.setItem("TpAuthToken", JSON.stringify(response.data.data));
        form.reset();

        // // Redirect to /mail-verify with email as query parameter
        setTimeout(() => {
          router.push("/mail-verify");
        }, 300); // 300ms delay before redirecting

        // Redirect to /mail-verify with email as query parameter
      } else {
        toast({
          title: "Warning",
          description:
            response.data.message ||
            "Unexpected response. Please contact support.",
          variant: "warning",
        });
      }
    } catch (err: any) {
      const errorCode = err.response?.status;
      const errorMessage =
        err.response?.data?.error || "Something went wrong. Please try again.";

      if (errorCode === 409) {
        // Handle uniqueness conflicts
        toast({
          title: "Conflict",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 my-12 border border-[#E8EAEE] dark:border-dark-border">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">Sign up</h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Sign up now to get started with an account
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignUp)}
          className="flex flex-col gap-4"
        >
          {/* User Type Switch */}
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-center items-center gap-3">
                  <span className="text-sm text-paragraph dark:text-dark-text">Client</span>
                  <Switch
                    checked={field.value === "vendor"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "vendor" : "client")
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-paragraph dark:text-dark-text">Vendor</span>
                </div>
              </FormItem>
            )}
          />

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
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  disabled={loading}
                />
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
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  disabled={loading}
                />
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
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-2">
        <div className="h-[1px] flex-1 bg-[#E8EAEE] dark:bg-dark-border" />
        <span className="text-sm text-paragraph dark:text-dark-text">or</span>
        <div className="h-[1px] flex-1 bg-[#E8EAEE] dark:bg-dark-border" />
      </div>

      <div className="flex flex-col gap-3">
        <Button 
          type="button"
          variant="outline"
          className="h-11 border border-[#E8EAEE] dark:border-dark-border hover:bg-white/90 dark:hover:bg-dark-input-bg rounded-lg text-paragraph dark:text-dark-text flex items-center justify-center gap-2"
        >
          <Image src="/assets/google.svg" alt="Google" width={20} height={20} />
          Sign up with Google
        </Button>
        <Button 
          type="button"
          variant="outline"
          className="h-11 border border-[#E8EAEE] dark:border-dark-border hover:bg-white/90 dark:hover:bg-dark-input-bg rounded-lg text-paragraph dark:text-dark-text flex items-center justify-center gap-2"
        >
          <Image src="/assets/facebook.svg" alt="Facebook" width={20} height={20} />
          Sign up with Facebook
        </Button>
      </div>

      <p className="text-sm text-paragraph dark:text-dark-text text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Page;
