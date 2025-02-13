import { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";

const TestStripe = () => {
  const [vendorId, setVendorId] = useState(""); // Store vendor ID
  const [stripeConnectId, setStripeConnectId] = useState(""); // Store Stripe Connect ID
  const [onboardingUrl, setOnboardingUrl] = useState(""); // Store onboarding URL
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Simulated vendor details (for testing)
  const mockVendor = {
    vendorId: "67a25847874d7400973e3a65", // Replace with actual vendor ID from DB
    email: "vendor@gmail.com",
    country: "US", // Change based on vendor's country
  };

  // 1️⃣ Fetch or Create a Stripe Connect Account
  const setupStripeAccount = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/create-connect-account", {
        vendorId: mockVendor.vendorId,
        email: mockVendor.email,
        country: mockVendor.country,
      });

      if (res.data.stripeConnectId) {
        setStripeConnectId(res.data.stripeConnectId);
        setVendorId(mockVendor.vendorId);
        setMessage(res.data.message || "Stripe Connect account ready.");
      } else {
        setMessage(
          res.data.error || "Error setting up Stripe Connect account."
        );
      }
    } catch (error: any) {
      console.error("Error setting up Stripe Connect account:", error);
      setMessage(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ Generate Stripe Onboarding Link
  const generateOnboardingLink = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/generate-account-link", {
        vendorId,
      });

      if (res.data.success) {
        setOnboardingUrl(res.data.url);
      } else {
        setMessage(res.data.error || "Error generating onboarding link.");
      }
    } catch (error: any) {
      console.error("Error generating onboarding link:", error);
      setMessage(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Test Stripe Connect Onboarding</h2>

      {/* Setup Stripe Connect Account */}
      <Button onClick={setupStripeAccount} disabled={loading}>
        {loading ? "Processing..." : "Setup Stripe Connect Account"}
      </Button>

      {stripeConnectId && (
        <p>
          <strong>Stripe Connect ID:</strong> {stripeConnectId}
        </p>
      )}

      {/* Generate Onboarding Link */}
      {stripeConnectId && (
        <Button
          variant="secondary"
          onClick={generateOnboardingLink}
          disabled={loading}
        >
          {loading ? "Generating..." : "Complete Onboarding"}
        </Button>
      )}

      {/* Redirect to Stripe Onboarding */}
      {onboardingUrl && (
        <p>
          <a href={onboardingUrl} target="_blank" rel="noopener noreferrer">
            <Button>Go to Stripe Onboarding</Button>
          </a>
        </p>
      )}

      {/* Status Messages */}
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default TestStripe;
