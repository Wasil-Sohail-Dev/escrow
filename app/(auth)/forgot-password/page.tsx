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
      // Here you would typically make an API call to your backend
      // to handle the password reset request
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
    <div className="flex flex-col gap-10 max-md:px-3 max-md:mt-7 w-full max-w-md border border-white-3 p-10 shadow-md rounded">
      <div className="">
        <h1 className="text-heading1-semibold text-dark-1">Reset Password</h1>
        <p className="text-small-regular text-dark-2">
          Enter the email you used to create your account so we can send you instructions on how to reset your password.
        </p>
      </div>

      {success ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            Password reset instructions have been sent to your email.
          </p>
          <Link href="/login">
            <Button className="primary-btn w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleForgotPassword)}
            className="flex flex-col gap-5 mt-5"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-dark-1">Enter registered email or phone number</FormLabel>
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

            {error && (
              <p className="text-red-500">{error}</p>
            )}

            <Button type="submit" className="primary-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Send"}
            </Button>

            <Link href="/login">
              <Button variant="outline" className="w-full">
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