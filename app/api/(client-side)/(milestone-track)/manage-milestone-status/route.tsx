import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema"; // Import Payment schema
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY!);

interface Milestone {
  milestoneId: string;
  status: string;
}

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { contractId, milestoneId, newStatus } = body;

    // Validate input
    if (!contractId || !milestoneId || !newStatus) {
      return NextResponse.json(
        { error: "Contract ID, Milestone ID, and new status are required." },
        { status: 400 }
      );
    }

    // Fetch the contract
    const contract = await Contract.findOne({ contractId: contractId });
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    // Validate contract state
    if (contract.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot update milestones for a canceled contract." },
        { status: 400 }
      );
    }

    // Ensure the contract status is either "funding_onhold" or "active"
    if (contract.status !== "funding_onhold" && contract.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Milestones can only be updated when the contract is in the 'funding_onhold' or 'active' state.",
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

    // Find the current milestone
    const milestoneIndex: number = contract.milestones.findIndex(
      (milestone: Milestone) => milestone.milestoneId === milestoneId
    );
    if (milestoneIndex === -1) {
      return NextResponse.json(
        { error: "Milestone not found in the contract." },
        { status: 404 }
      );
    }

    // Check sequence rule
    for (let i = 0; i < milestoneIndex; i++) {
      if (contract.milestones[i].status !== "approved") {
        return NextResponse.json(
          {
            error: `Milestone '${contract.milestones[i].milestoneId}' must be approved before updating this milestone.`,
          },
          { status: 400 }
        );
      }
    }

    // Update milestone status
    const allowedTransitions = {
      pending: ["working"],
      working: ["ready_for_review"],
      ready_for_review: ["change_requested", "approved"],
      change_requested: ["ready_for_review"],
      approved: ["payment_released"],
      disputed: ["resolved"],
    };

    const currentStatus = contract.milestones[milestoneIndex]
      .status as keyof typeof allowedTransitions;

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from '${currentStatus}' to '${newStatus}'.`,
        },
        { status: 400 }
      );
    }

    // If the milestone status is being updated to "working", capture the funding
    if (newStatus === "working") {
      // Fetch the Payment record related to this contract
      const payment = await Payment.findOne({
        contractId: contract._id,
        status: "on_hold",
      });

      if (!payment) {
        return NextResponse.json(
          { error: "No payment record found for this contract." },
          { status: 400 }
        );
      }

      const paymentIntentId = payment.stripePaymentIntentId; // Get PaymentIntent ID from Payment schema

      if (paymentIntentId) {
        try {
          // Capture the payment
          await stripe.paymentIntents.capture(paymentIntentId);
          console.log(`Captured payment for PaymentIntent ${paymentIntentId}`);
        } catch (error) {
          console.error("Error capturing payment:", error);
          return NextResponse.json(
            { error: "Failed to capture the payment." },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "PaymentIntent ID not found for this contract." },
          { status: 400 }
        );
      }
    }

    // Update the milestone status
    contract.milestones[milestoneIndex].status = newStatus;

    // Save the updated contract
    await contract.save();

    return NextResponse.json(
      {
        message: "Milestone status updated successfully.",
        milestone: contract.milestones[milestoneIndex],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
