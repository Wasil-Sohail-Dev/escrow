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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { JwtPayload } from "jsonwebtoken";
import { useUser } from "@/contexts/UserContext";

const vendorSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  userName: z.string().min(1, { message: "Username is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  companyName: z.string().min(1, { message: "Company name is required" }),
  companyId: z.string().min(1, { message: "Company ID is required" }),
  companyAddress: z.string().min(1, { message: "Company address is required" }),

});

const clientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userName: z.string().min(1, "Username is required"),
  phone: z.string().min(1, "Phone number is required"),

});

type VendorFormValues = z.infer<typeof vendorSchema>;
type ClientFormValues = z.infer<typeof clientSchema>;

const Page = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { refreshUser } = useUser();
  const [jwt, setJwt] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      try {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const cookieValue = parts.pop()?.split(";").shift();
          return cookieValue ? decodeURIComponent(cookieValue) : null;
        }
        return null;
      } catch (error) {
        console.log("Error parsing cookie:", error);
        return null;
      }
    };

    const tokenCookie = getCookie("TpAuthToken");
    if (tokenCookie) {
      try {
        const parsedToken = JSON.parse(tokenCookie);
        setJwt(parsedToken);
      } catch (error) {
        console.log("Error parsing token:", error);
      }
    }
      const rawJwt = localStorage.getItem("TpAuthToken");
      if (rawJwt) {
        setJwt(JSON.parse(rawJwt));
    }

  }, []);
  const form = useForm<VendorFormValues | ClientFormValues>({
    resolver: zodResolver(jwt?.userType === "vendor" ? vendorSchema : clientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      phone: "",
      ...(jwt?.userType === "vendor" && {
        companyName: "",
        companyId: "",
        companyAddress: "",
      }),
    },
    mode: "onBlur",
  });
  const handleOnboarding = async (data: VendorFormValues | ClientFormValues) => {
    setLoading(true);
    try {
      const apiData = jwt?.userType === "vendor" ? data : {
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.userName,
        phone: data.phone,
      };
      const response = await axios.post("/api/save-onboarding", {...apiData,email:jwt?.email,userType:jwt?.userType});
      if (response.status === 200) {
        toast({
          title: "Success",
          description: response.data.message || "Onboarding completed!",
          variant: "default",
        });
        const { email, onboardingToken, userStatus } = response.data.user;
        localStorage.removeItem("TpAuthToken");
        const result = await signIn("credentials", {
          redirect: false,
          email,
          onboardingToken,
          userStatus,
        });
        if (result?.ok) {
          router.push("/home");
          await refreshUser();
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                    First Name *
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
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                    Last Name *
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
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Username *
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
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                  Phone Number *
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

          {jwt?.userType === "vendor" && (
            <>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                      Company Name *
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                      Company ID *
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm text-paragraph dark:text-dark-text">
                      Company Address *
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
            </>
          )}
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