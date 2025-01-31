import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";

// Initialize Stripe clients with the escrow and platform secret keys
if (!process.env.PLATFORM_FEE_STRIPE_SECRET_KEY) {
  throw new Error(
    "PLATFORM_FEE_STRIPE_SECRET_KEY is not defined in environment variables."
  );
}
const escrowStripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

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

    // Fetch the payment record from the database
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    const { contractId, platformFee, escrowAmount } = payment;

    // Fetch the associated contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Capture the payment in the escrow account
    const paymentIntent = await escrowStripe.paymentIntents.capture(
      paymentIntentId
    );

    if (paymentIntent.status === "succeeded") {
      // Dynamically retrieve account IDs
      const escrowAccountId = process.env.ESCROW_STRIPE_ACCOUNT_ID || "";
      const platformFeeAccountId =
        process.env.PLATFORM_FEE_STRIPE_ACCOUNT_ID || "";

      console.log("Escrow Account ID:", escrowAccountId);
      console.log("Platform Fee Account ID:", platformFeeAccountId);

      // Transfer the platform fee to the platform fee account
      await escrowStripe.transfers.create({
        amount: Math.round(platformFee * 100), // Convert to cents
        currency: "usd",
        description: `Platform fee for contract: ${contractId}`,
        destination: platformFeeAccountId, // Platform fee account ID
      });

      console.log("Platform fee transfer succeeded:");

      // Transfer the escrow amount to the vendor account (payee)
      await escrowStripe.transfers.create({
        amount: Math.round(escrowAmount * 100), // Convert to cents
        currency: "usd",
        description: `Escrow amount for contract: ${contractId}`,
        destination: escrowAccountId, // Vendor account ID (payee)
      });

      console.log("Escrow transfer succeeded:");

      // Update payment record in the database
      payment.status = "funded";
      await payment.save();

      // Update contract status
      contract.status = "active";
      await contract.save();

      return NextResponse.json(
        {
          success: true,
          message:
            "Payment captured successfully. Platform fee and escrow transferred.",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Payment capture failed" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error capturing payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
