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
import Image from "next/image";

// Validation Schema
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const Page = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
      setError(result.error);
    } else if (result?.ok) {
      router.push("/home");
    } else {
      setError("An unexpected error occurred.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 border border-[#E8EAEE] dark:border-dark-border">
      <div className="space-y-1">
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
            render={({ field, fieldState }) => (
              <FormItem>
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
                {fieldState.error?.message && (
                  <FormMessage className="text-sm">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Password
                </FormLabel>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  required
                  disabled={loading}
                />
                {fieldState.error?.message && (
                  <FormMessage className="text-sm">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {error && (
            <p className="text-error-accent">{error}</p>
          )}

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-500">
              Forgot Password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="h-11 bg-primary hover:bg-primary/90 text-white dark:text-dark-text rounded-lg"
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

      <div className="flex items-center gap-2">
        <div className="h-[1px] flex-1 bg-[#E8EAEE] dark:bg-dark-border" />
        <span className="text-sm text-paragraph dark:text-dark-text">OR</span>
        <div className="h-[1px] flex-1 bg-[#E8EAEE] dark:bg-dark-border" />
      </div>

      <div className="flex flex-col gap-3">
        <Button 
          type="button"
          variant="outline"
          className="h-11 border border-[#E8EAEE] dark:border-dark-border hover:bg-white/90 dark:hover:bg-dark-input-bg rounded-lg text-paragraph dark:text-dark-text flex items-center justify-center gap-2"
        >
          <Image src="/assets/google.svg" alt="Google" width={20} height={20} />
          Sign in with Google
        </Button>
        <Button 
          type="button"
          variant="outline"
          className="h-11 border border-[#E8EAEE] dark:border-dark-border hover:bg-white/90 dark:hover:bg-dark-input-bg rounded-lg text-paragraph dark:text-dark-text flex items-center justify-center gap-2"
        >
          <Image src="/assets/facebook.svg" alt="Facebook" width={20} height={20} />
          Sign in with Facebook
        </Button>
      </div>

      <p className="text-sm text-paragraph dark:text-dark-text text-center">
        Don&apos;t have an account?{" "}
        <Link href="/user-register" className="text-primary hover:text-primary-500">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Page;
