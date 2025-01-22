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
import { Eye, EyeOff } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Validation Schema
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const Page = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { refreshUser } = useUser();
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
console.log(result,"result");
    if (result?.error) {
      setError(result.error==="CredentialsSignin"?"Credentials are not valid":result.error);
    } else if (result?.ok) {
      await refreshUser();
      router.push("/home");
    } else {
      setError("An unexpected error occurred.");
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const result = await signIn("google", { redirect: false });

      if (result?.error) {
        setError("Failed to sign in with Google.");
      } else if (result?.ok && result.url) {
        router.push(result.url);
      }
    } catch (error) {
      setError("Something went wrong with Google sign-in.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setFacebookLoading(true);
      const result = await signIn("facebook", { redirect: false });

      if (result?.error) {
        setError("Failed to sign in with Facebook.");
      } else if (result?.ok && result.url) {
        router.push(result.url);
      }
    } catch (error) {
      setError("Something went wrong with Facebook sign-in.");
    } finally {
      setFacebookLoading(false);
    }
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-500">
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
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Image src="/assets/google.svg" alt="Google" width={20} height={20} />
              Sign in with Google
            </>
          )}
        </Button>

        <Button 
          type="button"
          variant="outline"
          className="h-11 border border-[#E8EAEE] dark:border-dark-border hover:bg-white/90 dark:hover:bg-dark-input-bg rounded-lg text-paragraph dark:text-dark-text flex items-center justify-center gap-2"
          onClick={handleFacebookSignIn}
          disabled={facebookLoading}
        >
          {facebookLoading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Image src="/assets/facebook.svg" alt="Facebook" width={20} height={20} />
              Sign in with Facebook
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-paragraph dark:text-dark-text text-center">
        Don't have an account?{" "}
        <Link href="/user-register" className="text-primary hover:text-primary-500">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Page;
