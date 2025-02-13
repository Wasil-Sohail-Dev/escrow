import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import Stripe from "stripe";
import { sendNotification } from "@/lib/actions/sender.action";

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
    const { contractId, clientId, vendorId, platformFee, escrowAmount } =
      await req.json();

    // Validate required fields
    if (
      !contractId ||
      !clientId ||
      !vendorId ||
      !platformFee ||
      !escrowAmount
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Fetch contract details
    const contract = await Contract.findOne({ contractId }).populate(
      "clientId vendorId",
      "email username"
    );

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    // Ensure the contract is in `funding_pending` state
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

    const totalAmount = Math.round((platformFee + escrowAmount) * 100);

    // Create Payment Intent with Stripe
    const paymentIntent = await escrowStripe.paymentIntents.create({
      amount: totalAmount, // Convert to cents
      currency: "usd",
      capture_method: "manual", // Funds stay in escrow until captured
      description: `Payment for contract: ${contractId}`,
      receipt_email: contract.clientId.email,
      metadata: {
        contractId,
        platformFee: platformFee.toString(),
        escrowAmount: escrowAmount.toString(),
      },
      transfer_group: contractId, // Links all transfers together
    });

    // **📌 Send Notification to Vendor**
    try {
      await sendNotification({
        receiverId: vendorId.toString(),
        senderId: clientId.toString(),
        title: "Contract Funded",
        message: `The client has successfully added funds to the escrow for contract ${contractId}. Work can now begin.`,
        type: "payment",
        severity: "success",
        link: `/contact-details/${contractId}`,
        meta: { contractId, escrowAmount },
      });
    } catch (notificationError) {
      console.error("Error sending funding notification:", notificationError);
    }

    return NextResponse.json(
      {
        message: "Payment intent created successfully.",
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
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
