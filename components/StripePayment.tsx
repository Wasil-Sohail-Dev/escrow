import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "./ui/button";

// Load Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentPageProps {
  contractId: string;
  clientId: string;
  vendorId: string;
  platformFee: number;
  escrowAmount: number;
}

const PaymentPage: React.FC<PaymentPageProps> = ({
  contractId,
  clientId,
  vendorId,
  platformFee,
  escrowAmount,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const stripe = useStripe();
  const elements = useElements();

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-intent-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setMessage("PaymentIntent retrieved. Enter card details.");
      } else if (data.error) {
        setMessage(data.error || "Failed to retrieve PaymentIntent.");
      } else {
        const createResponse = await fetch("/api/client-funding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractId,
            clientId,
            vendorId,
            platformFee,
            escrowAmount,
          }),
        });

        const createData = await createResponse.json();

        if (createData.clientSecret) {
          setClientSecret(createData.clientSecret);
          setMessage("PaymentIntent created. Enter card details.");
        } else {
          setMessage(createData.error || "Failed to create PaymentIntent.");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred.");
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement) ?? { token: "" },
          },
        }
      );
      console.log("paymentIntent", paymentIntent);
      console.log("paymentIntent", paymentIntent?.status);

      if (error) {
        setMessage(error.message || "An unknown error occurred.");
      } else if (paymentIntent.status === "requires_capture") {
        setMessage("Payment succeeded!");
        // await fetch("/api/payment-success", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        // });
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during payment.");
    }
    setLoading(false);
  };

  return (
    <div>
      <Button onClick={createPaymentIntent} disabled={loading} className="mt-5">
        {loading ? "Processing..." : "Start Payment"}
      </Button>

      {clientSecret && (
        <div>
          <CardElement />
          <Button
            onClick={handlePayment}
            disabled={loading || !stripe || !elements}
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

const StripePayment: React.FC<PaymentPageProps> = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentPage {...props} />
  </Elements>
);

export default StripePayment;
