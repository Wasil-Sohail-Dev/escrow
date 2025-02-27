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
    if (!["resolved", "rejected"].includes(status)) {
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

    // Find the dispute
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

    // Update dispute status and details
    dispute.status = status;
    dispute.resolutionDetails = reason;
    await dispute.save();

    // If resolved, update contract and milestone status
    if (status === "resolved") {
      const contract = await Contract.findById(dispute.contractId._id);
      if (contract) {
        // Find the disputed milestone
        const milestone = contract.milestones.find(
          (m: any) => m.milestoneId === dispute.milestoneId
        );

        if (milestone) {
          // Update milestone status based on winner
          if (winner === "client") {
            milestone.status = "change_requested";
            contract.status = "active"; // Reactivate contract
          } else {
            milestone.status = "approved";
            contract.status = "active"; // Reactivate contract
          }
          await contract.save();
        }
      }
    }

    // Send notifications to all parties
    const notifications = [];

    // Notification for the party who raised the dispute
    notifications.push(
      sendNotification({
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
          reason
        }
      })
    );

    // Notification for the other party
    notifications.push(
      sendNotification({
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
          reason
        }
      })
    );

    // Send all notifications
    await Promise.all(notifications);

    return NextResponse.json({
      success: true,
      message: `Dispute ${status === "resolved" ? "resolved" : "rejected"} successfully`,
      dispute
    });

  } catch (error: any) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 