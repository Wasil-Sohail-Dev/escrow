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
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";

// Validation Schema
const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userName: z.string().min(1, "Username is required"),
  phone: z.string().min(1, "Phone number is required"),
  companyName: z.string().min(1, "Company name is required"),
  companyId: z.string().min(1, "Company ID is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  acceptTerms: z.boolean().refine((data) => data === true, {
    message: "You must accept the terms and conditions",
  }),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const Page = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      phone: "",
      companyName: "",
      companyId: "",
      companyAddress: "",
      acceptTerms: false,
    },
  });

  const handleOnboarding = async (data: OnboardingFormValues) => {
    setLoading(true);

    try {
      const response = await axios.post("/api/save-onboarding", data);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: response.data.message || "Onboarding completed!",
          variant: "default",
        });

        const { email, onboardingToken } = response.data.user;
        localStorage.removeItem("TpAuthToken");

        const result = await signIn("credentials", {
          redirect: false,
          email,
          onboardingToken,
        });

        if (result?.ok) {
          router.push("/home");
        } else {
          toast({
            title: "Error",
            description: result?.error || "Login failed.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Warning",
          description: response.data.message || "Unexpected response.",
          variant: "warning",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 py-10 my-12 border border-[#E8EAEE] dark:border-dark-border shadow-sm rounded-sm">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">
          Onboarding
        </h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Sign up now to get started with an account
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleOnboarding)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                    First Name
                  </FormLabel>
                  <Input
                    {...field}
                    placeholder="Enter your First Name"
                    className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                    Last Name
                  </FormLabel>
                  <Input
                    {...field}
                    placeholder="Enter your Last Name"
                    className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Username
                </FormLabel>
                <Input
                  {...field}
                  placeholder="Enter your username"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Phone Number
                </FormLabel>
                <Input
                  {...field}
                  placeholder="Enter your Phone Number"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Company Name
                </FormLabel>
                <Input
                  {...field}
                  placeholder="Enter Company Name"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Company ID
                </FormLabel>
                <Input
                  {...field}
                  placeholder="Enter Company ID"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Company Address
                </FormLabel>
                <Input
                  {...field}
                  placeholder="Enter Company Address"
                  className="h-11 dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                    I agree to the terms and conditions
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="h-11 bg-primary hover:bg-primary/90 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Complete"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
