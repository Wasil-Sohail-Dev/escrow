/**
 * This function handles the process of releasing milestone payments securely using Stripe for a given
 * contract and milestone.
 * @param {Request} req - The `req` parameter in the `POST` function represents the incoming request
 * object. It contains information about the HTTP request made to the server, such as headers, body,
 * URL parameters, and more. In this specific context, the `req` object is used to extract data from
 * the incoming request
 * @returns The POST request function is returning a JSON response with either a success message if the
 * milestone payment release is successful, or an error message if there are any issues during the
 * process. The response includes status codes for different scenarios such as 200 for success, 400 for
 * bad request, 404 for not found, and 500 for internal server error.
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";
import { ConnectAccount } from "@/models/ConnectAccountSchema";
import { sendNotification } from "@/lib/actions/sender.action";

// Initialize Stripe
if (
  !process.env.PLATFORM_FEE_STRIPE_SECRET_KEY ||
  !process.env.ESCROW_STRIPE_ACCOUNT_ID
) {
  throw new Error("Stripe secret key or Escrow Stripe Account ID is not set.");
}
const escrowStripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

interface Milestone {
  milestoneId: string;
  amount: number;
  status: string;
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { contractId, milestoneId, clientId } = await req.json();

    if (!contractId || !milestoneId || !clientId) {
      return NextResponse.json(
        { error: "Contract ID, Milestone ID, and Client ID are required." },
        { status: 400 }
      );
    }

    // Fetch contract details and populate vendorId
    const contract = await Contract.findOne({ contractId }).populate(
      "vendorId",
      "stripeAccountId"
    );

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    // Find the specific milestone
    const milestone: Milestone | undefined = contract.milestones.find(
      (m: Milestone) => m.milestoneId === milestoneId
    );

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found." },
        { status: 404 }
      );
    }

    // Ensure milestone is approved before releasing payment
    if (milestone.status !== "approved") {
      return NextResponse.json(
        { error: "Payment can only be released for approved milestones." },
        { status: 400 }
      );
    }

    // Fetch the related payment (It should be in 'funded' or 'partially_released' status)
    const payment = await Payment.findOne({
      contractId: contract._id,
      status: { $in: ["funded", "partially_released"] },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "No funded payment found for this contract." },
        { status: 404 }
      );
    }

    // **Security Check: Ensure escrow holds enough funds before releasing**
    if (payment.onHoldAmount < milestone.amount) {
      return NextResponse.json(
        {
          error: `Insufficient escrow funds. Available: ${payment.onHoldAmount}, Required: ${milestone.amount}`,
        },
        { status: 400 }
      );
    }

    // **Security Check: Prevent over-release beyond escrowAmount**
    if (payment.releasedAmount + milestone.amount > payment.escrowAmount) {
      return NextResponse.json(
        {
          error: "Cannot release more than the total escrowed amount.",
        },
        { status: 400 }
      );
    }

    // Get vendor's Stripe Connect account ID
    if (!contract.vendorId) {
      return NextResponse.json(
        { error: "Vendor does not have a Stripe Connect account." },
        { status: 400 }
      );
    }

    // Fetch vendor's Stripe Connect account ID from the database
    const connectAccount = await ConnectAccount.findOne({
      vendorId: contract.vendorId,
      verificationStatus: "verified",
    }).select("stripeAccountId");

    if (!connectAccount || !connectAccount.stripeAccountId) {
      return NextResponse.json(
        { error: "Vendor's Stripe Connect account not found or not verified." },
        { status: 404 }
      );
    }

    const vendorStripeAccountId = connectAccount.stripeAccountId;

    // Transfer milestone funds from escrow to vendor's Stripe Connect account
    const transfer = await escrowStripe.transfers.create({
      amount: Math.round(milestone.amount * 100),
      currency: "usd",
      destination: vendorStripeAccountId,
      description: `Milestone payment release for ${milestoneId} (Contract: ${contractId})`,
      metadata: {
        contractId: contract.contractId.toString(),
        milestoneId: milestone.milestoneId.toString(),
        type: "release",
      },
      transfer_group: contractId,
    });

    console.log("Milestone Payment Transfer ID:", transfer.id);

    // **Update payment schema**
    payment.onHoldAmount -= milestone.amount;
    payment.releasedAmount += milestone.amount;
    payment.status =
      payment.onHoldAmount === 0 ? "fully_released" : "partially_released";
    await payment.save();

    // **📌 Send Notification to Vendor**
    try {
      await sendNotification({
        receiverId: contract.vendorId.toString(),
        senderId: clientId.toString(),
        title: "Milestone Payment Released",
        message: `The client has released payment for milestone ${milestoneId}. Funds are on their way to your account.`,
        type: "payment",
        severity: "success",
        link: `/contact-details/${contractId}`,
        meta: { contractId, milestoneId, amount: milestone.amount },
      });
    } catch (notificationError) {
      console.error(
        "Error sending milestone payment notification:",
        notificationError
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Milestone payment released successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error releasing milestone payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
