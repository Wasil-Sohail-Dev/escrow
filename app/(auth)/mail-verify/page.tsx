"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form"; // Import `shadcn` form components
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type VerifyCodeFormValues = {
  otp: string;
};

// Define the type for the JWT payload
interface JwtPayload {
  email: string;
  token: string;
  userStatus: string; // e.g., "pendingVerification" | "verified"
}

const Page = () => {
  const [error, setError] = useState<string>("");
  const [jwt, setJwt] = useState<JwtPayload | null>(null); // Store parsed JWT
  const [otp, setOtp] = useState<string>(""); // State to manage OTP input
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  const router = useRouter();

  useEffect(() => {
    // Safely parse the JWT item from localStorage
    const rawJwt = localStorage.getItem("TpAuthToken");

    if (!rawJwt) {
      router.push("/user-register"); // Redirect if JWT is not found
      return;
    }

    try {
      const parsedJwt: JwtPayload = JSON.parse(rawJwt);
      if (
        !parsedJwt.email?.trim() ||
        !parsedJwt.token?.trim() ||
        parsedJwt.userStatus === "verified"
      ) {
        router.push("/user-register"); // Redirect if invalid JWT or user is already verified
      } else {
        setJwt(parsedJwt); // Set JWT if valid
      }
    } catch (error) {
      console.error("Failed to parse JWT from localStorage:", error);
      router.push("/user-register"); // Redirect on parse error
    }
  }, [router]);

  // Initialize the form
  const form = useForm<VerifyCodeFormValues>();

  // Handle form submission
  const handleVerifyCode = async () => {
    setError(""); // Reset any previous errors

    if (otp.trim().length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true); // Set loading state

    try {
      const response = await axios.post("/api/verify-mail-code", {
        email: jwt?.email,
        code: otp,
      });

      if (response.status === 200) {
        // Update localStorage to reflect user is now verified
        const updatedJwt = { ...jwt, userStatus: "verified" };
        localStorage.setItem("TpAuthToken", JSON.stringify(updatedJwt));

        // Redirect to /on-boarding with email as query parameter
        setTimeout(() => {
          router.push("/on-boarding");
        }, 300); // 300ms delay before redirecting
      } else {
        setError(response.data.message || "Verification failed.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "An error occurred while verifying the code."
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  if (!jwt) return null; // Show nothing while verifying JWT

  return (
    <div className="flex flex-col gap-5 max-md:px-3 max-md:mt-7 w-full max-w-md border border-white-3 p-10 shadow-md rounded text-center">
      <h1 className="text-heading1-semibold text-dark-1">Check your Email</h1>
      <p className="text-small-regular text-dark-2">
        We have sent an email with verification instructions to{" "}
        {jwt.email.replace(/(.{1,2}).+(.{1})@(.{1}).+/, "$1***$2@$3***")}
      </p>

      {/* shadcn Form Wrapper */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyCode();
          }}
          className="flex flex-col gap-5"
        >
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            onChange={(value) => setOtp(value)} // Update OTP state
            disabled={isLoading} // Disable input during loading
          >
            <InputOTPGroup className="w-full justify-center gap-4">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {error && <p className="text-red-500">{error}</p>}

          <Button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Verify"}
          </Button>

          <Link href="/sign-in">
            <p className="text-dark-2 cursor-pointer text-right hover:text-dark-3 text-body-bold underline">
              Back to Login
            </p>
          </Link>
        </form>
      </Form>
    </div>
  );
};

export default Page;
