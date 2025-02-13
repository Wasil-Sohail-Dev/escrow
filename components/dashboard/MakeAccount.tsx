import React, { useState } from "react";
import { Button } from "../ui/button";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";

const MakeAccount = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Setup Stripe Connect Account
  const setupStripeAccount = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/create-connect-account", {
        vendorId: user?._id,
        email: user?.email,
        country: "US", // You might want to get this from user data
      });
      console.log(res.data);
      if (res.data.stripeAccountId) {
        // Generate onboarding link immediately after account creation
        generateOnboardingLink(res.data.stripeAccountId);
      } else {
        setError(res.data.error || "Error setting up Stripe Connect account.");
      }
    } catch (error: any) {
      console.error("Error setting up Stripe Connect account:", error);
      setError(
        error.response?.data?.error ||
          "An error occurred while setting up your Stripe account."
      );
    }
  };

  // Generate Stripe Onboarding Link
  const generateOnboardingLink = async (connectId: string) => {
    try {
      const res = await axios.post("/api/generate-account-link", {
        vendorId: user?._id,
      });

      if (res.data.success) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else {
        setError(res.data.error || "Error generating onboarding link.");
      }
    } catch (error: any) {
      console.error("Error generating onboarding link:", error);
      setError(
        error.response?.data?.error ||
          "An error occurred while generating the onboarding link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-red-500 text-white rounded-lg flex items-center justify-between px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            For Secure Payments, Please create your Stripe account to escrow
            first!
          </p>
          {error && <p className="text-sm text-white/90">{error}</p>}
        </div>
        <Button
          variant="outline"
          className="bg-transparent border-white text-white hover:bg-white/20 whitespace-nowrap"
          onClick={setupStripeAccount}
          disabled={loading}
        >
          {loading ? "Setting up..." : "Create Stripe Account"}
        </Button>
      </div>
    </div>
  );
};

export default MakeAccount;
