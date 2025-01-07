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
    <div className="flex flex-col gap-10 max-md:px-3 max-md:mt-7 w-full max-w-md 
      border border-white-3 dark:border-dark-2 
      bg-white-1 dark:bg-dark-1 
      p-14 shadow-md rounded
      transition-colors duration-300"
    >
      <div className="space-y-2">
        <h1 className="text-heading1-semibold text-dark-1 dark:text-white-1 transition-colors">
          Welcome back
        </h1>
        <p className="text-small-regular text-dark-2 dark:text-white-2 transition-colors">
          Welcome back! Please enter your details.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignIn)}
          className="flex flex-col gap-5 mt-5"
        >
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-dark-1 dark:text-white-1 transition-colors">
                  Email
                </FormLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className="border-white-3 dark:border-dark-2 
                    bg-white-1 dark:bg-dark-3 
                    text-dark-1 dark:text-white-1
                    placeholder:text-dark-2 dark:placeholder:text-white-2
                    focus:border-primary dark:focus:border-primary-500
                    transition-colors"
                  required
                  disabled={loading}
                />
                {fieldState.error?.message && (
                  <FormMessage className="text-error-accent dark:text-error-text">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-dark-1 dark:text-white-1 transition-colors">
                  Password
                </FormLabel>
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  className="border-white-3 dark:border-dark-2 
                    bg-white-1 dark:bg-dark-3 
                    text-dark-1 dark:text-white-1
                    placeholder:text-dark-2 dark:placeholder:text-white-2
                    focus:border-primary dark:focus:border-primary-500
                    transition-colors"
                  required
                  disabled={loading}
                />
                {fieldState.error?.message && (
                  <FormMessage className="bg-error-bg dark:bg-error-accent/20 
                    text-error-accent dark:text-error-text 
                    border border-error-accent dark:border-error-text 
                    rounded-md p-2">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {error && (
            <p className="text-error-accent dark:text-error-text">{error}</p>
          )}

          <Link href="/forgot-password">
            <p className="cursor-pointer text-right 
              text-primary dark:text-primary-300 
              hover:text-primary-500 dark:hover:text-primary-500 
              text-small-semibold transition-colors">
              Forgot Password?
            </p>
          </Link>

          <Button 
            type="submit" 
            className="primary-btn hover:bg-primary-500 
              dark:bg-primary-500 dark:hover:bg-primary 
              transition-colors"
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : "Sign In"}
          </Button>
        </form>
      </Form>

      <div className="flex justify-center items-center gap-2">
        <div className="w-24 border border-dark-2/30 dark:border-white-2/30"></div>
        <p className="text-dark-1 dark:text-white-1">OR</p>
        <div className="w-24 border border-dark-2/30 dark:border-white-2/30"></div>
      </div>

      <p className="text-small-semibold text-dark-2 dark:text-white-2 text-center">
        Don't have an account?{" "}
        <Link href={"/user-register"}>
          <span className="text-primary dark:text-primary-300 
            hover:text-primary-500 dark:hover:text-primary-500 
            transition-colors">
            Sign up
          </span>
        </Link>
      </p>
    </div>
  );
};

export default Page;
