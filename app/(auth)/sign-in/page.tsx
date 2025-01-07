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
    <div className="flex flex-col gap-10 max-md:px-3 max-md:mt-7 w-full max-w-md border border-white-3 p-14 shadow-md rounded">
      <div className="">
        <h1 className="text-heading1-semibold text-dark-1">Welcome back</h1>
        <p className="text-small-regular text-dark-2">
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
                <FormLabel className="text-dark-1">Email</FormLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className="border-white-3"
                  required
                  disabled={loading}
                />
                {/* Display error message inline */}
                {fieldState.error?.message && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
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
                <FormLabel className="text-dark-1">Password</FormLabel>
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  className="border-white-3"
                  required
                  disabled={loading}
                />
                {/* Display error message inline */}
                {fieldState.error?.message && (
                  <FormMessage className="bg-error-bg p-2 text-error-accent border border-error-accent rounded-md ">
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {error && <p className="text-red-500">{error}</p>}

          <Link href="/forgot-password">
            <p className="cursor-pointer text-right hover:text-dark-3 text-small-semibold text-primary">
              Forgot Password?
            </p>
          </Link>

          <Button type="submit" className="primary-btn" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Sign In"}
          </Button>
        </form>
      </Form>
      <div className="flex justify-center items-center gap-2">
        <div className="w-[130] border border-[#0000004D]"></div>
        <p>OR</p>
        <div className="w-[130] border border-[#0000004D]"></div>
      </div>
      <p className="text-small-semibold text-dark-2 text-center">
        Don’t have an account?{" "}
        <Link href={"/user-register"}>
          <span className="text-primary">Sign up</span>
        </Link>
      </p>
    </div>
  );
};

export default Page;
