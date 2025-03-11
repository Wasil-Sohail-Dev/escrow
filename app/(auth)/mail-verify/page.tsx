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
import { toast } from "@/hooks/use-toast";

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
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const router = useRouter();

  const form = useForm<VerifyCodeFormValues>();

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
      router.push("/user-register");
    }
  }, [router]);

  // Timer effect for resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: jwt?.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "OTP has been resent to your email",
        });
        setResendTimer(60); // Start 60 second cooldown
      } else {
        if (response.status === 429) {
          // Rate limit hit
          setResendTimer(data.remainingTime || 60);
          setError(data.error);
        } else {
          setError(data.error || "Failed to resend OTP");
        }
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

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

  return (
    <div className="flex flex-col gap-12 w-full max-w-[500px] bg-white dark:bg-dark-input-bg p-12 py-10 border border-[#E8EAEE] dark:border-dark-border shadow-sm rounded-sm">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-semibold text-paragraph dark:text-dark-text">
          Verify your code
        </h1>
        <p className="text-sm text-paragraph/60 dark:text-dark-text/60">
          Enter the passcode you just received on your email address ending with{" "}
          {jwt?.email.replace(/(.{1,2}).+(.{1})@(.{1}).+/, "$1***$2@$3***")}
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

          <div className="flex flex-col gap-2">
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

            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={resendLoading || resendTimer > 0}
              className="h-11 text-primary hover:text-primary/90 hover:bg-primary/10"
            >
              {resendLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : resendTimer > 0 ? (
                `Resend OTP in ${resendTimer}s`
              ) : (
                "Resend OTP"
              )}
            </Button>
          </div>

          <Link href="/sign-in" className="w-full">
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
