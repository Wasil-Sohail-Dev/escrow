"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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

interface JwtPayload {
  email: string;
  token: string;
  userStatus: string;
}

const Page = () => {
  const [error, setError] = useState<string>("");
  const [jwt, setJwt] = useState<JwtPayload | null>(null);
  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const rawJwt = localStorage.getItem("TpAuthToken");

    if (!rawJwt) {
      router.push("/user-register");
      return;
    }

    try {
      const parsedJwt: JwtPayload = JSON.parse(rawJwt);
      if (
        !parsedJwt.email?.trim() ||
        !parsedJwt.token?.trim() ||
        parsedJwt.userStatus === "verified"
      ) {
        router.push("/user-register");
      } else {
        setJwt(parsedJwt);
      }
    } catch (error) {
      console.error("Failed to parse JWT from localStorage:", error);
      // router.push("/user-register");
    }
  }, [router]);
  const form = useForm<VerifyCodeFormValues>();

  const handleVerifyCode = async () => {
    setError("");
    if (otp.trim().length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/verify-mail-code", {
        email: jwt?.email,
        code: otp,
      });

      if (response.status === 200) {
        const updatedJwt = { ...jwt, userStatus: "verified" };
        localStorage.setItem("TpAuthToken", JSON.stringify(updatedJwt));
        // const { email, onboardingToken } = response.data.user;
        // localStorage.removeItem("TpAuthToken");

        // const result = await signIn("credentials", {
        //   redirect: false,
        //   email,
        //   onboardingToken,
        // });
        setTimeout(() => {
          router.push("/on-boarding");
        }, 300);
      } else {
        setError(response.data.message || "Verification failed.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "An error occurred while verifying the code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // if (!jwt) return null;  

  return (
    <div className="flex flex-col gap-12 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 py-10 border border-[#E8EAEE] dark:border-dark-border shadow-sm rounded-sm">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">
          Verify your code
        </h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Enter the passcode you just received on your email address ending with{" "}
          {jwt?.email.replace(/(.{1,2}).+(.{1})@(.{1}).+/, "$1***$2@$3***")}
          {/* ******in@gmail.com */}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyCode();
          }}
          className="flex flex-col gap-4"
        >
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
            className="gap-2"
          >
            <InputOTPGroup className="w-full justify-center gap-4">
              <InputOTPSlot
                index={0}
                className="h-12 w-12 border border-[#D1D5DB] dark:border-dark-border rounded text-paragraph dark:text-dark-text"
              />
              <InputOTPSlot
                index={1}
                className="h-12 w-12 border border-[#D1D5DB] dark:border-dark-border rounded text-paragraph dark:text-dark-text"
              />
              <InputOTPSlot
                index={2}
                className="h-12 w-12 border border-[#D1D5DB] dark:border-dark-border rounded text-paragraph dark:text-dark-text"
              />
              <InputOTPSlot
                index={3}
                className="h-12 w-12 border border-[#D1D5DB] dark:border-dark-border rounded text-paragraph dark:text-dark-text"
              />
              <InputOTPSlot
                index={4}
                className="h-12 w-12 border border-[#D1D5DB] dark:border-dark-border rounded text-paragraph dark:text-dark-text"
              />
              <InputOTPSlot
                index={5}
                className="h-12 w-12 border border-[#D1D5DB] dark:border-dark-border rounded text-paragraph dark:text-dark-text"
              />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="text-error-accent text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="h-11 bg-primary hover:bg-primary/90 text-white rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Verify"
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
    </div>
  );
};

export default Page;
