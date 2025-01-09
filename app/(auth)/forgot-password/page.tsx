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
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation Schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (data: ForgotPasswordFormValues) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-6 py-10 border border-[#E8EAEE] dark:border-dark-border shadow-sm rounded-sm">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">Reset Password</h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Enter the email you used to create your account so we can send you instructions on how to reset your password.
        </p>
      </div>

      {success ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            Password reset instructions have been sent to your email.
          </p>
          <Link href="/login">
            <Button className="h-11 bg-primary hover:bg-primary/90 text-white w-full rounded-lg">
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleForgotPassword)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                    Enter registered email or phone number
                  </FormLabel>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 border dark:bg-dark-input-bg border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                    required
                    disabled={loading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-error-accent text-sm">{error}</p>
            )}

            <Button 
              type="submit" 
              className="h-11 bg-primary hover:bg-primary/90 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send"
              )}
            </Button>

            <Link href="/login" className="w-full">
              <Button 
                variant="outline" 
                className="h-11 w-full border border-[#E8EAEE] dark:border-dark-border hover:bg-white/90 dark:hover:bg-dark-input-bg rounded-lg text-paragraph dark:text-dark-text"
              >
                Back to Login
              </Button>
            </Link>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ForgotPassword;