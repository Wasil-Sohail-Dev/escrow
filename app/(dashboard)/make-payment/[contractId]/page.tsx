"use client";

import Topbar from "@/components/dashboard/Topbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { calculateTax } from "@/lib/helpers/calculateTax";
import { Button } from "@/components/ui/button";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useContract } from "@/contexts/ContractContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_PLATFORM_STRIPE_PUBLISHABLE_KEY || ""
);

function PaymentPage() {
  const { contractId: contractID } = useParams<{ contractId: string }>();
  const [bankFee, setBankFee] = useState<number>(0);
  const router = useRouter();
  const { toast } = useToast();
  const { contract, fetchContract } = useContract();

  // Add loading state for both buttons
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
  } | null>(null);

  useEffect(() => {
    if (contractID) {
      fetchContract(contractID);
    }
  }, [contractID]);

  const escrowTax = calculateTax(
    contract?.budget || 0,
    (contract?.contractType || "services") as "services" | "products"
  );

  const createPaymentIntent = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch("/api/check-intent-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contractID,
        }),
      });

      const data = await response.json();
      console.log("payment data", data);
      if (data.clientSecret) {
        router.push(`/make-payment/${contractID}/${data.paymentIntentId}`);
      } else {
        const createResponse = await fetch("/api/client-funding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractId: contractID,
            clientId: contract?.clientId?._id,
            vendorId: contract?.vendorId?._id,
            platformFee: escrowTax,
            escrowAmount: contract?.budget,
          }),
        });

        const createData = await createResponse.json();

        if (createData.paymentIntentId) {
          router.push(
            `/make-payment/${contractID}/${createData.paymentIntentId}`
          );
          toast({
            title: "PaymentIntent created. Enter card details.",
            variant: "default",
          });
        } else {
          toast({
            title: "Failed to create PaymentIntent.",
            description: createData.error || "Failed to create PaymentIntent.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred.",
        description: "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promotion code",
        variant: "destructive",
      });
      return;
    }

    setPromoLoading(true);
    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode,
          action: "validate",
        }),
      });

      const data = await response.json();

      if (data.success) {
        const discountAmount = escrowTax * (data.discountPercentage / 100);
        setAppliedPromo({
          code: promoCode,
          discountPercentage: data.discountPercentage,
          discountAmount,
        });
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        setAppliedPromo(null);
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast({
        title: "Error",
        description: "Failed to apply promotion code",
        variant: "destructive",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  // Calculate final amounts
  const finalServiceFee = escrowTax - (appliedPromo?.discountAmount || 0);
  const totalAmount = (contract?.budget || 0) + finalServiceFee + bankFee;

  return (
    <>
      <Topbar
        title="Make Payment"
        description=" Add the following details in order to complete your payment."
      />
      <div className="flex flex-col lg:flex-row gap-[60px] justify-center lg:gap-[140px] mt-[45px] lg:mt-[85px] px-4 lg:px-0">
        <div className="w-full lg:w-[500px]">
          <div className="bg-[#D4F1E9] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-md p-4 lg:p-6">
            <h2 className="text-[18px] lg:text-[22px] text-center font-semibold mb-4 lg:mb-6 text-[#292929] dark:text-dark-text">
              Make Payment
            </h2>

            <div className="space-y-4">
              {/* Contract Details */}
              <div className="pb-4 border-b border-[#474747] dark:border-dark-border">
                <h3 className="text-[16px] font-semibold text-[#474747] dark:text-dark-text mb-2">
                  Contract Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-[#474747] dark:text-dark-text">
                      Contract ID
                    </span>
                    <span className="text-body-normal text-[#474747] dark:text-dark-text">
                      {contract?.contractId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-[#474747] dark:text-dark-text">
                      Project Name
                    </span>
                    <span className="text-body-normal text-[#474747] dark:text-dark-text truncate">
                      {contract?.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="pb-4 border-b border-[#474747] dark:border-dark-border">
                <h3 className="text-[16px] font-semibold text-[#474747] dark:text-dark-text mb-2">
                  User Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-[#474747] dark:text-dark-text">
                      Client Name
                    </span>
                    <span className="text-body-normal text-[#474747] dark:text-dark-text">
                      {contract?.clientId?.userName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-[#474747] dark:text-dark-text">
                      Vendor Name
                    </span>
                    <span className="text-body-normal text-[#474747] dark:text-dark-text">
                      {contract?.vendorId?.userName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="pb-4 border-b border-[#474747] dark:border-dark-border">
                <h3 className="text-[16px] font-semibold text-[#474747] dark:text-dark-text mb-2">
                  Payment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-[#474747] dark:text-dark-text">
                      Balance amount
                    </span>
                    <span className="text-body-normal text-[#474747] dark:text-dark-text">
                      $ {contract?.budget?.toFixed(2)}
                    </span>
                  </div>

                  {/* Promotion Code Input */}
                  <div className="py-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter promotion code"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#E8EAEE] dark:border-dark-border bg-white dark:bg-dark-input-bg text-[#474747] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                      />
                      <Button
                        onClick={handleApplyPromoCode}
                        disabled={promoLoading || !promoCode}
                        className="bg-primary hover:bg-primary/90 text-white dark:text-dark-text min-w-[80px]"
                      >
                        {promoLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                    {appliedPromo && (
                      <div className="mt-2 flex justify-between items-center bg-primary/10 p-2 rounded-lg">
                        <div>
                          <p className="text-primary font-medium">
                            {appliedPromo.code}
                          </p>
                          <p className="text-sm text-[#474747] dark:text-dark-text">
                            {appliedPromo.discountPercentage}% discount on Third
                            Party Service Fee
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoCode("");
                          }}
                          className="text-[#E71D1D] hover:text-[#E71D1D]/90"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-[#474747] dark:text-dark-text">
                      Third Party Service Fee
                    </span>
                    <div className="text-right">
                      <span className="text-body-normal text-[#474747] dark:text-dark-text">
                        $ {escrowTax?.toFixed(2)}
                      </span>
                      {appliedPromo && (
                        <div className="text-sm text-primary">
                          - $ {appliedPromo.discountAmount.toFixed(2)}{" "}
                          (Discount)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-body-medium text-[#474747] dark:text-dark-text">
                      Payment Processing Fee
                    </span>
                    <span className="text-body-normal text-[#474747] dark:text-dark-text">
                      $ {bankFee?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[16px] font-semibold text-[#474747] dark:text-dark-text">
                    Total Amount:
                  </span>
                  <span className="text-[16px] font-semibold text-[#474747] dark:text-dark-text">
                    $ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={createPaymentIntent}
              disabled={paymentLoading}
              className="w-full h-[48px] lg:h-[58px] bg-primary hover:bg-primary/90 text-white dark:text-dark-text rounded-lg mt-4 lg:mt-6 transition-colors font-[700] text-[18px] lg:text-[24px] leading-[19px]"
            >
              {paymentLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                "Make Payment"
              )}
            </Button>
          </div>
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
