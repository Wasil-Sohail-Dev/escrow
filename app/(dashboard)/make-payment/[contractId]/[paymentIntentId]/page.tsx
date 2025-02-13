"use client";

import Topbar from "@/components/dashboard/Topbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@/contexts/UserContext";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useContract } from "@/contexts/ContractContext";
import { useTheme } from "next-themes";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_PLATFORM_STRIPE_PUBLISHABLE_KEY || ""
);

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      lineHeight: "24.13px",
      backgroundColor: "transparent",
      color: "#292929",
      "::placeholder": {
        color: "#676767BD",
      },
    },
    invalid: {
      color: "#EF4444",
    },
  },
};

const cardElementOptionsForDarkMode = {
  style: {
    base: {
      fontSize: "16px",
      lineHeight: "24.13px",
      backgroundColor: "transparent",
      color: "white",
      "::placeholder": {
        color: "#676767BD",
      },
    },
    invalid: {
      color: "#EF4444",
    },
  },
};

function PaymentPage() {
  const { contractId: contractID, paymentIntentId: paymentIntentId } =
    useParams<{
      contractId: string;
      paymentIntentId: string;
    }>();
  console.log(paymentIntentId, "paymentIntentId");

  const { user } = useUser();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const router = useRouter();
  const { contract, fetchContract } = useContract();
  const { theme } = useTheme();

  // Add state for billing details
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    address: {
      line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "IN", // Default to India
    },
  });

  // Add loading state for both buttons
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [processingLoading, setProcessingLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (contractID) {
      fetchContract(contractID);
    }
  }, [contractID]);
  useEffect(() => {
    if (paymentIntentId) {
      fetchClientSecret();
    }
  }, [paymentIntentId]);

  const fetchClientSecret = async () => {
    try {
      const response = await fetch("/api/check-intent-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contractID }),
      });
      const data = await response.json();
      console.log(data, "data");
      if (response.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        toast({
          title: "Error",
          description: "Failed to retrieve payment details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching client secret:", error);
      toast({
        title: "Error",
        description: "An error occurred while retrieving payment details.",
        variant: "destructive",
      });
    }
  };
  const handlePayment = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setProcessingLoading(true);
    try {
      if (!stripe || !elements || !clientSecret) {
        toast({
          title: "Stripe is not loaded or client secret is missing.",
          variant: "destructive",
        });
        return;
      }

      // Validate billing details
      if (
        !billingDetails.name ||
        !billingDetails.address.line1 ||
        !billingDetails.address.city ||
        !billingDetails.address.state ||
        !billingDetails.address.postal_code
      ) {
        toast({
          title: "Missing billing details",
          description: "Please fill in all billing details",
          variant: "destructive",
        });
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement) ?? { token: "" },
            billing_details: {
              name: billingDetails.name,
              address: billingDetails.address,
            },
          },
        }
      );

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
        });
      } else if (paymentIntent?.status === "requires_capture") {
        toast({
          title: "Payment succeeded!",
          description: "Payment succeeded!",
          variant: "default",
        });
        router.push(`/contact-details/${contractID}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error during payment:", error);
    } finally {
      setProcessingLoading(false);
    }
  };

  return (
    <>
      <Topbar
        title="Make Payment"
        description=" Add the following details in order to complete your payment."
      />
      <div className="flex flex-col lg:flex-row gap-[60px] justify-center lg:gap-[140px] mt-[45px] lg:mt-[85px] px-4 lg:px-0">
        <div className="w-full lg:max-w-[530px]">
          <h1 className="text-[22px] lg:text-[30px] font-bold mb-2 dark:text-dark-text">
            Lets Make Payment
          </h1>
          <p className="text-[13px] lg:text-[14px] leading-[21px] text-[#575757] dark:text-dark-text/60 mb-6 lg:mb-8 font-[400]">
            To start your subscription, input your card details to make payment.
            You will be redirected to your banks authorization page .
          </p>

          <form className="space-y-4 w-full">
            <div className="flex w-full flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex-1 space-y-2">
                <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                  Project ID
                </label>
                <Input
                  type="text"
                  value={contractID}
                  disabled
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                />
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                  Vendor Name
                </label>
                <Input
                  type="text"
                  value={user?.userName}
                  disabled
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                Project Title
              </label>
              <Input
                type="text"
                value={contract?.title}
                disabled
                className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[14px] text-[#292929] dark:text-dark-text font-semibold mb-2 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={billingDetails.name}
                  onChange={(e) =>
                    setBillingDetails((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                />
              </div>

              <div>
                <label className="text-[14px] text-[#292929] dark:text-dark-text font-semibold mb-2 block">
                  Address
                </label>
                <Input
                  type="text"
                  value={billingDetails.address.line1}
                  onChange={(e) =>
                    setBillingDetails((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  placeholder="Street address"
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    value={billingDetails.address.city}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                    placeholder="City"
                    className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={billingDetails.address.state}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value },
                      }))
                    }
                    placeholder="State"
                    className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                  />
                </div>
              </div>

              <div>
                <Input
                  type="text"
                  value={billingDetails.address.postal_code}
                  onChange={(e) =>
                    setBillingDetails((prev) => ({
                      ...prev,
                      address: {
                        ...prev.address,
                        postal_code: e.target.value,
                      },
                    }))
                  }
                  placeholder="PIN code"
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                Card Details
              </label>

              {/* Card Number */}
              <div className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Image
                    src="/assets/mastercard.png"
                    alt="Visa"
                    width={32}
                    height={20}
                  />
                </div>
                <div className="pl-16 h-full flex items-center pt-[13.5px]">
                  <CardNumberElement
                    options={
                      theme === "dark"
                        ? cardElementOptionsForDarkMode
                        : cardElementOptions
                    }
                    className="w-full h-full pt-[2px]"
                  />
                </div>
              </div>

              {/* Expiry and CVC in a row */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg">
                    <div className="px-4 h-full flex items-center pt-[13.5px]">
                      <CardExpiryElement
                        options={
                          theme === "dark"
                            ? cardElementOptionsForDarkMode
                            : cardElementOptions
                        }
                        className="w-full h-full pt-[2px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg">
                    <div className="px-4 h-full flex items-center pt-[13.5px]">
                      <CardCvcElement
                        options={
                          theme === "dark"
                            ? cardElementOptionsForDarkMode
                            : cardElementOptions
                        }
                        className="w-full h-full pt-[2px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={handlePayment}
              disabled={processingLoading}
              className="w-full h-[48px] lg:h-[58px] bg-primary hover:bg-primary/90 text-white dark:text-dark-text rounded-lg transition-colors text-[16px] lg:text-[20.81px] font-[700] leading-[25.18px]"
            >
              {processingLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                "Proceed"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPage />
    </Elements>
  );
}
