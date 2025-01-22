import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is not defined in environment variables.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required" },
        { status: 400 }
      );
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update payment status in database
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: "completed" }
      );

      // Update contract status
      await Contract.findOneAndUpdate(
        { paymentIntentId: paymentIntentId },
        { status: "active" }
      );

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Payment capture failed" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error capturing payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 