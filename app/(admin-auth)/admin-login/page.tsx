"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      loginSchema.parse(formData);

      // Direct API call to admin auth endpoint
      const response = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Authentication Failed",
          description: data.error || "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      // Session is already created by the backend
      toast({
        title: "Success",
        description: "Admin logged in successfully",
      });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-1 dark:bg-dark-bg">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-dark-input-bg p-8 rounded-lg shadow-lg border border-sidebar-border dark:border-dark-border">
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-16 h-16  rounded-lg flex items-center justify-center mx-auto">
                <Image
                  src={"/assets/logo.png"}
                  alt="logo"
                  width={118}
                  height={118}
                  className={""}
                />
              </div>
            </div>
            <h1 className="text-heading2-bold text-main-heading dark:text-dark-text">
              Welcome back
            </h1>
            <p className="text-base-regular text-dark-2">
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-base-medium text-paragraph dark:text-dark-text mb-2"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text focus:outline-none focus:border-primary"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 dark:text-dark-text" />
              </div>
              {errors.email && (
                <p className="mt-1 text-small-regular text-error-text">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base-medium text-paragraph dark:text-dark-text mb-2"
              >
                Password 
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text focus:outline-none focus:border-primary"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 dark:text-dark-text" />
              </div>
              {errors.password && (
                <p className="mt-1 text-small-regular text-error-text">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary border-sidebar-border dark:border-dark-border rounded focus:ring-primary"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-small-regular text-paragraph dark:text-dark-text"
                >
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-primary text-primary-foreground rounded-lg py-3 text-base-medium transition-all
                ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-primary-500"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
