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
    <div className="flex flex-col gap-5 max-md:px-3 max-md:mt-7 w-full max-w-md border border-white-3 p-10 shadow-md rounded">
      <div className="text-center">
        <h1 className="text-heading1-semibold text-dark-1">Sign Up</h1>
        <p className="text-small-regular text-dark-2">
          Sign up now to get started with an account.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignUp)}
          className="flex flex-col gap-5 mt-5"
        >
          {/* User Type Switch */}
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-center items-center space-x-2">
                  <label className="text-dark-1">Vendor</label>
                  <Switch
                    checked={field.value === "client"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "client" : "vendor")
                    }
                  />
                  <label className="text-dark-1">Client</label>
                </div>
              </FormItem>
            )}
          />

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
                  placeholder="example@email.com"
                  className="border-white-3"
                  disabled={loading}
                />
                <FormMessage>{fieldState.error?.message}</FormMessage>
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
                  placeholder="Enter your password"
                  className="border-white-3"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Password must include at least 8 characters, one uppercase,
                  one lowercase, one number, and one special character.
                </p>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="cnfPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-dark-1">Confirm Password</FormLabel>
                <Input
                  {...field}
                  type="password"
                  placeholder="Confirm your password"
                  className="border-white-3"
                  disabled={loading}
                />
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Accept Policy Checkbox */}
          <FormField
            control={form.control}
            name="acceptPolicy"
            render={({ field, fieldState }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                  <FormLabel className="text-dark-1">
                    I accept the{" "}
                    <a href="/policy" className="text-blue-500">
                      policy
                    </a>
                  </FormLabel>
                </div>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <Button type="submit" className="primary-btn" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Sign Up"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
