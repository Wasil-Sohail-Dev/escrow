import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import Stripe from "stripe";
import { Payment } from "@/models/paymentSchema";

// Initialize Stripe with the escrow account's secret key
if (!process.env.PLATFORM_FEE_STRIPE_SECRET_KEY) {
  throw new Error(
    "PLATFORM_FEE_STRIPE_SECRET_KEY is not defined in environment variables."
  );
}
const escrowStripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { contractId, clientId, vendorId, platformFee, escrowAmount } = body;

    // Validate required fields
    if (
      !contractId ||
      !clientId ||
      !vendorId ||
      !platformFee ||
      !escrowAmount
    ) {
      return NextResponse.json(
        {
          error:
            "Contract ID, Client ID, Vendor ID, Platform Fee, and Escrow Amount are required.",
        },
        { status: 400 }
      );
    }

    // Find the contract from the database
    const contract = await Contract.findOne({ contractId }).populate(
      "clientId vendorId",
      "email username firstName lastName"
    );

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    // Check contract status
    if (contract.status !== "funding_pending") {
      return NextResponse.json(
        {
          error: `Payment not allowed. Contract is in '${contract.status}' state.`,
        },
        { status: 400 }
      );
    }

    // Validate escrow amount
    if (escrowAmount !== contract.budget) {
      return NextResponse.json(
        {
          error: `Escrow amount (${escrowAmount}) must match the contract budget (${contract.budget}).`,
        },
        { status: 400 }
      );
    }

    const totalAmount = platformFee + escrowAmount;

    // Create Payment Intent with Escrow Stripe account
    const paymentIntent = await escrowStripe.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents
      currency: "usd",
      capture_method: "manual", // Authorize without capturing
      description: `Payment for contract: ${contractId}`,
      receipt_email: contract.clientId.email,
      metadata: {
        contractId,
        platformFee: platformFee.toString(),
        escrowAmount: escrowAmount.toString(),
      },
    });

    // Save payment details in the database
    const payment = new Payment({
      contractId: contract._id,
      payerId: contract.clientId._id,
      payeeId: contract.vendorId._id,
      amount: totalAmount,
      platformFee,
      escrowAmount,
      stripePaymentIntentId: paymentIntent.id,
      status: "process",
    });

    await payment.save();

    // Update contract status
    contract.paymentIntentId = paymentIntent.id;
    contract.status = "funding_processing";
    await contract.save();

    // Send response with payment intent and other details
    return NextResponse.json(
      {
        message: "Payment intent created and authorized successfully.",
        clientSecret: paymentIntent.client_secret,
        platformFee,
        escrowAmount,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
