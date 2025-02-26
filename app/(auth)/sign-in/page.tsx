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
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Validation Schema
const signInSchema = z.object({
  email: z.string()
      .min(1, "Email is required")
      .email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const Page = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { refreshUser, user } = useUser();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const handleSignIn = async (data: SignInFormValues) => {
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    
    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : result.error === "Please verify your email before signing in."
          ? "Please verify your email before signing in"
          : result.error
      );
    } else if (result?.ok) {
      await refreshUser();
      if (user?.userStatus === "active") {
        router.push("/home");
      }
      else if (user?.userStatus === "verified") {
        router.push("/on-boarding");
      }
      else {
        router.push("/mail-verify");
      }
    } else {
      setError("An unexpected error occurred.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 border border-[#E8EAEE] dark:border-dark-border shadow-sm rounded-sm">
      <div className="text-left space-y-2">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">
          Welcome back
        </h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Welcome back! Please enter your details.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignIn)}
          className="flex flex-col gap-4"
        >
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
                  required
                  disabled={loading}
                />
                <FormMessage />
              </FormItem>
            )}
          />

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
                    className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40 pr-10"
                    required
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

          {error && (
            <p className="text-error-accent text-sm text-center">{error}</p>
          )}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary-500"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="h-11 bg-primary hover:bg-primary/90 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
      <p className="text-sm text-paragraph dark:text-dark-text text-center">
        Dont have an account?{" "}
        <Link
          href="/user-register"
          className="text-primary hover:text-primary-500"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Page;
