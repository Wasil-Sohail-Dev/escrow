"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserRound, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const SelectUserType = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Check for registration data
  useEffect(() => {
    const tempData = localStorage.getItem("tempRegisterData");
    if (!tempData) {
      toast({
        title: "Error",
        description: "Please complete the Registration form first",
        variant: "destructive",
      });
      router.push("/user-register");
    }
  }, [router, toast]);

  const handleUserTypeSelection = async () => {
    if (!selectedType) {
      toast({
        title: "Warning",
        description: "Please select an account type to continue",
        variant: "warning",
      });
      return;
    }

    setLoading(selectedType);
    const tempData = localStorage.getItem("tempRegisterData");
    
    if (!tempData) {
      toast({
        title: "Error",
        description: "Registration data not found",
        variant: "destructive",
      });
      router.push("/user-register");
      return;
    }

    try {
      const registerData = JSON.parse(tempData);
      const response = await axios.post("/api/register", {
        ...registerData,
        userType: selectedType
      });

      if (response.status === 201) {
        // Clear temporary data
        localStorage.removeItem("tempRegisterData");
        
        // Store auth token
        localStorage.setItem("TpAuthToken", JSON.stringify(response.data.data));
        
        toast({
          title: "Success",
          description: "Registration successful! Please check your email.",
          variant: "default",
        });

        setTimeout(() => {
          router.push("/mail-verify");
        }, 300);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (err.response?.status === 409) {
        router.push("/user-register");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleBackToRegister = () => {
    localStorage.removeItem("tempRegisterData");
    router.push("/user-register");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[800px] text-center">
        <h1 className="text-[32px] md:text-[40px] font-bold text-[#292929] dark:text-dark-text mb-4">
          Choose Your Account Type
        </h1>
        <p className="text-base text-paragraph/60 dark:text-dark-text/60 mb-12">
          Select how you&apos;d like to use our platform. You can be either a client looking to hire,<br />
          or a vendor offering your services.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            onClick={() => setSelectedType('client')}
            className={`relative cursor-pointer p-8 rounded-lg border-2 transition-all duration-200 ${
              selectedType === 'client' 
                ? 'border-primary bg-primary/5' 
                : 'border-[#E8EAEE] dark:border-dark-border hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            {/* Radio Button */}
            <div className="absolute right-4 top-4 w-6 h-6 rounded-full border-2 border-[#E8EAEE] dark:border-dark-border flex items-center justify-center">
              {selectedType === 'client' && (
                <div className="w-3 h-3 bg-primary rounded-full" />
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              {loading === 'client' ? (
                <div className="w-16 h-16 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-[#292929] dark:text-dark-text mb-2">
                  I&apos;m a Client
                </h2>
                <p className="text-paragraph/60 dark:text-dark-text/60">
                  I want to hire professionals and<br />manage projects
                </p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedType('vendor')}
            className={`relative cursor-pointer p-8 rounded-lg border-2 transition-all duration-200 ${
              selectedType === 'vendor' 
                ? 'border-primary bg-primary/5' 
                : 'border-[#E8EAEE] dark:border-dark-border hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            {/* Radio Button */}
            <div className="absolute right-4 top-4 w-6 h-6 rounded-full border-2 border-[#E8EAEE] dark:border-dark-border flex items-center justify-center">
              {selectedType === 'vendor' && (
                <div className="w-3 h-3 bg-primary rounded-full" />
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              {loading === 'vendor' ? (
                <div className="w-16 h-16 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserRound className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-[#292929] dark:text-dark-text mb-2">
                  I&apos;m a Vendor
                </h2>
                <p className="text-paragraph/60 dark:text-dark-text/60">
                  I want to offer my services and<br />find work opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 max-w-[400px] mx-auto">
          <Button 
            onClick={handleUserTypeSelection}
            disabled={loading !== null || !selectedType}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              "Complete Registration"
            )}
          </Button>

          <button
            onClick={handleBackToRegister}
            className="text-[15px] text-paragraph/60 dark:text-dark-text/60 hover:text-primary"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectUserType;