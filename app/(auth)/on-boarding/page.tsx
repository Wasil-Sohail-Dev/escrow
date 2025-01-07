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

interface JwtPayload {
  email: string;
  token: string;
  userStatus: string;
}

// Validation Schema
const onboardingSchema = z.object({
  email: z.string().email("Invalid email address"),
  userType: z.string().min(1, "User type is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userName: z.string().min(1, "Username is required"),
  phone: z.string().min(1, "Phone number is required"),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      email: "",
      userType: "",
      firstName: "",
      lastName: "",
      userName: "",
      phone: "",
      companyName: "",
      companyAddress: "",
    },
  });

  // Fetch user data from the database
  const fetchUserData = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/user-data`, {
          params: { email },
        });
        const userData = response.data.user; // Adjusted to match backend response structure

        // Populate the form with user data
        form.reset({
          email: userData.email,
          userType: userData.userType,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userName: userData.userName,
          phone: userData.phone,
          companyName: userData.companyName || "",
          companyAddress: userData.companyAddress || "",
        });

        setUserType(userData.userType); // Set userType for conditional rendering
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again.",
          variant: "destructive",
        });
        router.push("/user-register"); // Redirect on error
      } finally {
        setLoading(false);
      }
    },
    [form, router, toast]
  );

  useEffect(() => {
    // Parse JWT from localStorage
    const rawJwt = localStorage.getItem("TpAuthToken");

    if (!rawJwt) {
      router.push("/user-register");
      return;
    }

    try {
      const jwt: JwtPayload = JSON.parse(rawJwt);

      if (
        !jwt.email?.trim() ||
        !jwt.token?.trim() ||
        jwt.userStatus === "active"
      ) {
        router.push("/user-register");
        return;
      }

      // Fetch user data
      fetchUserData(jwt.email);
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      router.push("/user-register");
    }
  }, [router, fetchUserData]);

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

        // Extract the onboarding token from the response
        const { email, onboardingToken } = response.data.user;

        localStorage.removeItem("TpAuthToken");

        // Call NextAuth's signIn function with the onboarding token
        const result = await signIn("credentials", {
          redirect: false,
          email,
          onboardingToken, // Pass the onboarding token here
        });

        if (result?.ok) {
          // Redirect to home page after successful login
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
    <div className="flex flex-col gap-5 max-md:px-3 max-md:mt-7 w-full max-w-md border border-white-3 p-10 shadow-md rounded">
      <h1 className="text-heading1-semibold text-dark-1">Onboarding</h1>
      <p className="text-small-regular text-dark-2">
        Complete your onboarding to start using the platform.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleOnboarding)}
          className="flex flex-col gap-5 mt-5"
        >
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input {...field} type="email" disabled />
              </FormItem>
            )}
          />

          {/* User Type */}
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Type</FormLabel>
                <Input {...field} type="text" disabled />
              </FormItem>
            )}
          />

          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <Input {...field} type="text" />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <Input {...field} type="text" />
              </FormItem>
            )}
          />

          {/* Username */}
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <Input {...field} type="text" />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <Input {...field} type="text" />
              </FormItem>
            )}
          />

          {/* Company Fields (Conditional) */}
          {userType === "vendor" && (
            <>
              {/* Company Name */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <Input {...field} type="text" />
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* Company Address */}
              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <Input {...field} type="text" />
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Complete Onboarding"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
