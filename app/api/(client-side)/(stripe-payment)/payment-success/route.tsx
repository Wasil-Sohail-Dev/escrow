import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";

// Rate limiter to prevent abuse
const rateLimiter = new Map(); // A map to store recent requests

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { paymentIntentId } = await req.json();

    // Input validation
    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing paymentIntentId." },
        { status: 400 }
      );
    }

    // Rate limiting: Check if the same paymentIntentId is being processed repeatedly
    const now = Date.now();
    if (rateLimiter.has(paymentIntentId)) {
      const lastAttempt = rateLimiter.get(paymentIntentId);
      if (now - lastAttempt < 5000) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }
    rateLimiter.set(paymentIntentId, now);

    // Fetch the payment using the paymentIntentId
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    // Security check: Ensure payment exists
    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 }
      );
    }

    // Check if the payment is in "onHold" status, meaning it's awaiting processing
    if (payment.status !== "process") {
      return NextResponse.json(
        { error: "Invalid payment status." },
        { status: 400 }
      );
    }

    // Fetch the associated contract using the payment's contractId
    const contract = await Contract.findById(payment.contractId);

    // Security check: Ensure contract exists
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    // Check contract status to prevent multiple updates
    if (contract.status === "funding_onhold") {
      return NextResponse.json(
        { error: "Payment has already been processed." },
        { status: 400 }
      );
    }

    // Check contract status to ensure it's in funding_processing
    if (contract.status !== "funding_processing") {
      return NextResponse.json(
        { error: "Payment has not yet been processed." },
        { status: 400 }
      );
    }

    // Update contract status to 'funding_onhold'
    contract.status = "funding_onhold";
    await contract.save();

    // Update payment status to 'processed'
    payment.status = "on_hold";
    await payment.save();

    // Return success response
    return NextResponse.json(
      { message: "Payment successfully processed." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing payment:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
