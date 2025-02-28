import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";
import { Contract } from "@/models/ContractSchema";
import { sendNotification } from "@/lib/actions/sender.action";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { disputeId, adminId, status, winner, reason } = await req.json();

    console.log(disputeId, adminId, status, winner, reason, "disputeId, adminId, status, winner, reason");
    

    if (!disputeId || !adminId || !status || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate status
    if (!["resolved", "rejected", "process"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // If resolving, winner must be specified
    if (status === "resolved" && !winner) {
      return NextResponse.json(
        { success: false, error: "Winner must be specified when resolving dispute" },
        { status: 400 }
      );
    }

    // Find the dispute with populated references
    const dispute = await Dispute.findById(disputeId)
      .populate('raisedBy', 'email firstName lastName userName')
      .populate('raisedTo', 'email firstName lastName userName')
      .populate('contractId');

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: "Dispute not found" },
        { status: 404 }
      );
    }

    // Get the contract
    const contract = await Contract.findById(dispute.contractId._id);
    if (!contract) {
      return NextResponse.json(
        { success: false, error: "Associated contract not found" },
        { status: 404 }
      );
    }

    // Update dispute status and details
    dispute.status = status;
    dispute.resolutionDetails = reason;
    dispute.resolvedBy = adminId;
    dispute.resolvedAt = new Date();

    // Only set winner if status is resolved
    if (status === "resolved") {
      dispute.winner = winner;
    }

    // Handle contract status updates based on dispute resolution
    if (status === "resolved") {
      // When dispute is resolved, update contract status
      try {
        // First transition to disputed_resolved
        contract.status = "disputed_resolved";
        
        // Find and update the disputed milestone
        const milestone = contract.milestones.find(
          (m: any) => m.milestoneId.toString() === dispute.milestoneId.toString()
        );

        if (milestone) {
          // Update milestone status based on winner
          milestone.status = winner === "client" ? "change_requested" : "approved";
        }

        // Save the contract with disputed_resolved status
        await contract.save();

        // Then transition to active
        contract.status = "active";
        await contract.save();

      } catch (error: any) {
        return NextResponse.json(
          { success: false, error: "Failed to update contract status: " + error.message },
          { status: 400 }
        );
      }
    } else if (status === "process") {
      // When dispute is in process, update contract status to disputed_in_process
      try {
        contract.status = "disputed_in_process";
        
        // Update milestone status if exists
        const milestone = contract.milestones.find(
          (m: any) => m.milestoneId.toString() === dispute.milestoneId.toString()
        );

        if (milestone) {
          milestone.status = "disputed_in_process";
        }
        await contract.save();
      } catch (error: any) {
        return NextResponse.json(
          { success: false, error: "Failed to update contract status: " + error.message },
          { status: 400 }
        );
      }
    }

    await dispute.save();

    // Send notifications to all parties
    try {
      // Notification for the party who raised the dispute
      await sendNotification({
        receiverId: dispute.raisedBy._id.toString(),
        senderId: adminId,
        title: `Dispute ${status === "resolved" ? "Resolved" : "Rejected"}`,
        message: status === "resolved"
          ? `Your dispute has been resolved. ${winner === "client" ? "You have" : "The other party has"} been declared the winner.`
          : "Your dispute has been rejected.",
        type: "alert",
        severity: status === "resolved" ? "success" : "warning",
        link: `/dispute-chat/?disputeId=${disputeId}`,
        meta: {
          disputeId,
          status,
          winner,
          reason,
          contractStatus: contract.status
        }
      });

      // Notification for the other party
      await sendNotification({
        receiverId: dispute.raisedTo._id.toString(),
        senderId: adminId,
        title: `Dispute ${status === "resolved" ? "Resolved" : "Rejected"}`,
        message: status === "resolved"
          ? `The dispute has been resolved. ${winner === "vendor" ? "You have" : "The other party has"} been declared the winner.`
          : "The dispute has been rejected.",
        type: "alert",
        severity: status === "resolved" ? "success" : "warning",
        link: `/dispute-chat/?disputeId=${disputeId}`,
        meta: {
          disputeId,
          status,
          winner,
          reason,
          contractStatus: contract.status
        }
      });
    } catch (notificationError) {
      console.error("Error sending dispute notifications:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: `Dispute ${status === "resolved" ? "resolved" : "rejected"} successfully`,
      dispute,
      contract: {
        status: contract.status,
        milestoneStatus: contract.milestones.find((m: any) => m.milestoneId.toString() === dispute.milestoneId.toString())?.status
      }
    });

  } catch (error: any) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 