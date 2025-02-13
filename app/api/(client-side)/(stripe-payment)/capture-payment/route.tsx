/**
 * The function captures a payment, transfers platform fees and escrow amounts, and sends a
 * notification to the client upon successful processing.
 * @param {Request} req - The `req` parameter in the `POST` function represents the incoming request
 * object. It contains information about the HTTP request made to the server, such as headers, body,
 * parameters, and more. In this specific context, the `req` object is used to extract the
 * `paymentIntentId`
 * @returns The POST function returns a JSON response based on the outcome of processing a payment
 * capture request. Here are the possible return scenarios:
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";
import { sendNotification } from "@/lib/actions/sender.action";

// Initialize Stripe clients
if (
  !process.env.PLATFORM_FEE_STRIPE_SECRET_KEY ||
  !process.env.ESCROW_STRIPE_ACCOUNT_ID ||
  !process.env.PLATFORM_FEE_STRIPE_ACCOUNT_ID
) {
  throw new Error("Missing Stripe environment variables.");
}
const escrowStripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required." },
        { status: 400 }
      );
    }

    // Fetch the payment record
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    const { contractId, platformFee, escrowAmount, payerId } = payment;

    // Fetch the associated contract
    const contract = await Contract.findById(contractId).populate(
      "clientId vendorId",
      "email username"
    );

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    const transferGroup = contract.contractId.toString(); // Ensure it's a string

    // Retrieve account IDs
    const escrowAccountId = process.env.ESCROW_STRIPE_ACCOUNT_ID;
    const platformFeeAccountId = process.env.PLATFORM_FEE_STRIPE_ACCOUNT_ID;

    console.log("Escrow Account ID:", escrowAccountId);
    console.log("Platform Fee Account ID:", platformFeeAccountId);

    try {
      // **1️ Transfer Platform Fee (Auto-Payout)**
      const platformFeeTransfer = await escrowStripe.transfers.create({
        amount: Math.round(platformFee * 100),
        currency: "usd",
        description: `Platform fee for contract: ${transferGroup}`,
        destination: platformFeeAccountId || "",
        transfer_group: transferGroup,
        metadata: {
          contractId: transferGroup,
          type: "fee",
        },
      });

      console.log("Platform fee transfer succeeded:", platformFeeTransfer.id);

      // **2️⃣ Transfer Escrow Amount to Escrow Account (Manual Payout)**
      const escrowTransfer = await escrowStripe.transfers.create({
        amount: Math.round(escrowAmount * 100),
        currency: "usd",
        description: `Escrow amount for contract: ${transferGroup}`,
        destination: escrowAccountId || "",
        transfer_group: transferGroup,
        metadata: {
          contractId: transferGroup,
          type: "funding",
        },
      });

      console.log("Escrow transfer succeeded:", escrowTransfer.id);

      // **3️⃣ Only Capture Payment If Transfers Succeed**
      const paymentIntent = await escrowStripe.paymentIntents.capture(
        paymentIntentId
      );
      if (paymentIntent.status === "succeeded") {
        console.log("Payment captured successfully:", paymentIntent.id);

        // **📌 Send Notification to Client**
        try {
          await sendNotification({
            receiverId: payerId.toString(),
            senderId: contract.vendorId._id.toString(),
            title: "Payment Captured",
            message: `Your escrow payment for contract ${contractId} has been successfully processed.`,
            type: "payment",
            severity: "success",
            link: `/contact-details/${contractId}`,
            meta: { contractId, escrowAmount },
          });
        } catch (notificationError) {
          console.error(
            "Error sending payment capture notification:",
            notificationError
          );
        }

        return NextResponse.json(
          {
            success: true,
            message: "Payment captured and transfers successful.",
          },
          { status: 200 }
        );
      } else {
        throw new Error("Payment capture failed after successful transfers.");
      }
    } catch (transferError: any) {
      console.error("Error transferring funds:", transferError);

      return NextResponse.json(
        {
          error: "Transfer failed, payment not captured.",
          details: transferError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error processing capture-payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
