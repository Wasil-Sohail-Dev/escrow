import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import Stripe from "stripe";
import { Payment } from "@/models/paymentSchema";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is not defined in environment variables.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { contractId, clientId, vendorId, platformFee, escrowAmount } = body;

    console.log(contractId, clientId, vendorId, platformFee, escrowAmount);

    // Validate input
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

    // Fetch the contract
    const contract = await Contract.findOne({
      contractId: contractId,
    }).populate("clientId vendorId", "email username firstName lastName");

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    // Validate contract status cancellation
    if (contract.status === "cancelled") {
      return NextResponse.json(
        {
          error: `Payment not allowed. Contract is in '${contract.status}' state.`,
        },
        { status: 400 }
      );
    }

    // Ensure milestones array exists
    if (
      !Array.isArray(contract.milestones) ||
      contract.milestones.length === 0
    ) {
      return NextResponse.json(
        { error: "No milestones found in the contract." },
        { status: 400 }
      );
    }

    // Check if any milestone has the status 'working'
    // const isVendorWorking: boolean = contract.milestones.some(
    //   (milestone: { status: string }) => milestone.status === "working"
    // );

    // if (!isVendorWorking) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Payment not allowed. No milestones are currently in the 'working' state.",
    //     },
    //     { status: 400 }
    //   );
    // }

    // Validate contract status
    if (contract.status !== "funding_pending") {
      return NextResponse.json(
        {
          error: `Payment not allowed. Contract is in '${contract.status}' state.`,
        },
        { status: 400 }
      );
    }

    // Validate that escrowAmount matches contract budget
    if (escrowAmount !== contract.budget) {
      return NextResponse.json(
        {
          error: `Escrow amount (${escrowAmount}) must match the contract budget (${contract.budget}).`,
        },
        { status: 400 }
      );
    }

    // Define total amount
    const totalAmount = platformFee + escrowAmount; // Total amount to be charged

    // Extract client and vendor information
    const clientEmailOrUsername =
      contract.clientId.email || contract.clientId.username || "unknown";
    const vendorEmailOrUsername =
      contract.vendorId.email || contract.vendorId.username || "unknown";

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Convert to cents
      currency: "usd",
      description: `Payment for contract: ${contractId}`,
      receipt_email: contract.clientId.email, // Use client's email for receipt
      capture_method: "manual", // Authorize without capturing
      metadata: {
        contractId: contractId, // Human-readable contract ID
        clientEmailOrUsername: clientEmailOrUsername,
        vendorEmailOrUsername: vendorEmailOrUsername,
        platformFee: platformFee.toString(),
        escrowAmount: escrowAmount.toString(),
      },
    });

    // Save the payment details in the database
    const payment = new Payment({
      contractId: contract._id,
      payerId: contract.clientId._id,
      payeeId: contract.vendorId._id,
      amount: totalAmount,
      platformFee: platformFee,
      escrowAmount: escrowAmount,
      stripePaymentIntentId: paymentIntent.id,
      status: "process", // Initially pending
    });

    await payment.save();

    // Update the contract status
    contract.paymentIntentId = paymentIntent.id;
    contract.status = "funding_processing"; // Keep it pending until funds are captured
    await contract.save();

    // Respond with the client secret for the frontend
    return NextResponse.json(
      {
        message: "Payment intent created successfully.",
        clientSecret: paymentIntent.client_secret,
        platformFee: platformFee,
        escrowAmount: escrowAmount,
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
