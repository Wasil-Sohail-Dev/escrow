import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";
import { Customer } from "@/models/CustomerSchema";
import Stripe from "stripe";
import { sendNotification } from "@/lib/actions/sender.action";

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
    const { contractId, milestoneId, newStatus, customerId, userType } = body;

    // Validate input
    if (!contractId || !milestoneId || !newStatus || !customerId || !userType) {
      return NextResponse.json(
        {
          error:
            "Contract ID, Milestone ID, new status, customerId, and userType are required.",
        },
        { status: 400 }
      );
    }

    // Verify customer identity
    const user = await Customer.findById(customerId);
    if (!user || user.userType !== userType) {
      return NextResponse.json(
        { error: "Invalid user credentials. Unauthorized action." },
        { status: 403 }
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

    // Prevent changes if contract is disputed
    if (contract.status === "disputed") {
      return NextResponse.json(
        { error: "Cannot update milestones for a disputed contract." },
        { status: 400 }
      );
    }

    // Handle contract completion
    if (newStatus === "completed" && body.contractStatus === "completed") {
      // Check if there are any active disputes
      const hasActiveDisputes = contract.disputes?.some(
        (dispute: any) =>
          dispute.status === "pending" || dispute.status === "in_process"
      );

      if (hasActiveDisputes) {
        return NextResponse.json(
          {
            error:
              "Cannot complete contract with active disputes. Please resolve all disputes first.",
          },
          { status: 400 }
        );
      }

      // Check if all milestones are completed and payments released
      const allMilestonesCompleted = contract.milestones.every(
        (milestone: any) => milestone.status === "payment_released"
      );

      if (!allMilestonesCompleted) {
        return NextResponse.json(
          {
            error:
              "Cannot complete contract. All milestones must be completed and payments released.",
          },
          { status: 400 }
        );
      }

      // Update contract status to completed
      contract.status = "completed";
      contract.completedAt = new Date();
      await contract.save();

      // Send notifications to both parties
      try {
        const clientId = contract.clientId.toString();
        const vendorId = contract.vendorId.toString();

        // Notify client
        await sendNotification({
          receiverId: clientId,
          senderId: vendorId,
          title: "Contract Completed",
          message: `The contract "${contract.title}" has been marked as completed.`,
          type: "user",
          severity: "success",
          link: `/contact-details/${contractId}`,
          meta: { contractId, status: "completed" },
        });

        // Notify vendor
        await sendNotification({
          receiverId: vendorId,
          senderId: clientId,
          title: "Contract Completed",
          message: `The contract "${contract.title}" has been marked as completed.`,
          type: "user",
          severity: "success",
          link: `/contact-details/${contractId}`,
          meta: { contractId, status: "completed" },
        });
      } catch (notificationError) {
        console.error(
          "Error sending completion notifications:",
          notificationError
        );
      }

      return NextResponse.json(
        {
          message: "Contract completed successfully.",
          contractStatus: contract.status,
        },
        { status: 200 }
      );
    }

    // Validate contract state for other operations
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
      if (contract.milestones[i].status !== "payment_released") {
        return NextResponse.json(
          {
            error: `Milestone '${contract.milestones[i].milestoneId}' must be approved before updating this milestone.`,
          },
          { status: 400 }
        );
      }
    }

    // Define allowed milestone transitions
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

    // If the vendor starts working on the **first milestone**, activate the contract
    if (newStatus === "working" && milestoneIndex === 0) {
      // Ensure only the vendor can start the milestone
      if (userType !== "vendor") {
        return NextResponse.json(
          { error: "Only the vendor can start working on a milestone." },
          { status: 403 }
        );
      }

      // If contract is still "funding_onhold", update to "active"
      if (contract.status === "funding_onhold") {
        contract.status = "active";
      }

      // Capture the payment if contract is active
      if (contract.status === "active") {
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

        const paymentIntentId = payment.stripePaymentIntentId;
        if (paymentIntentId) {
          try {
            // Capture the payment
            await stripe.paymentIntents.capture(paymentIntentId);
            console.log(
              `Captured payment for PaymentIntent ${paymentIntentId}`
            );
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
    }

    // Update the milestone status
    contract.milestones[milestoneIndex].status = newStatus;
    await contract.save();

    // **📌 Send Notifications**
    try {
      if (newStatus === "working") {
        const clientId = contract.clientId.toString();

        await sendNotification({
          receiverId: clientId,
          senderId: user._id.toString(),
          title: "Milestone Work Started",
          message: `The vendor has started working on milestone ${milestoneId}.`,
          type: "user",
          severity: "info",
          link: `/contact-details/${contractId}`, // Redirect to contract details page
          meta: { contractId, milestoneId, newStatus },
        });

        // Notify vendor about contract activation
        if (contract.status === "active") {
          await sendNotification({
            receiverId: user._id.toString(),
            senderId: contract.clientId.toString(),
            title: "Contract Activated",
            message: `The contract ${contractId} is now active as the first milestone has begun.`,
            type: "system",
            severity: "success",
            link: `/contact-details/${contractId}`,
            meta: { contractId, newStatus: "active" },
          });
        }
      }
    } catch (notificationError) {
      console.error(
        "Error sending milestone notifications:",
        notificationError
      );
    }

    return NextResponse.json(
      {
        message: "Milestone status updated successfully.",
        milestone: contract.milestones[milestoneIndex],
        contractStatus: contract.status,
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
