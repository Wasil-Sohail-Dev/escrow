import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";
import { Contract } from "@/models/ContractSchema";
import { sendNotification } from "@/lib/actions/sender.action";

type DisputeStatus = 'pending' | 'process' | 'resolved';

const validTransitions: Record<DisputeStatus, DisputeStatus[]> = {
  pending: ["process"],
  process: ["resolved"],
  resolved: []
};

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { disputeId, newStatus } = await req.json();

    if (!disputeId || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Dispute ID and new status are required" },
        { status: 400 }
      );
    }

    // Find the dispute with populated references
    const dispute = await Dispute.findById(disputeId)
      .populate('contractId')
      .populate('raisedBy', 'email firstName lastName userName')
      .populate('raisedTo', 'email firstName lastName userName');

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: "Dispute not found" },
        { status: 404 }
      );
    }

    // Validate status transition
    const allowedNextStatuses = validTransitions[dispute.status as DisputeStatus];
    if (!allowedNextStatuses.includes(newStatus as DisputeStatus)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from ${dispute.status} to ${newStatus}` },
        { status: 400 }
      );
    }

    // Get the associated contract
    const contract = await Contract.findById(dispute.contractId._id);
    if (!contract) {
      return NextResponse.json(
        { success: false, error: "Associated contract not found" },
        { status: 404 }
      );
    }

    // Update contract status based on dispute status
    if (newStatus === "process") {
      contract.status = "disputed_in_process";
      
      // Update milestone status
      const milestone = contract.milestones.find(
        (m: any) => m.milestoneId.toString() === dispute.milestoneId.toString()
      );
      if (milestone) {
        milestone.status = "disputed_in_process";
      }
    }

    await contract.save();

    // Update dispute status
    dispute.status = newStatus as DisputeStatus;
    await dispute.save();

    // Send notifications to involved parties
    try {
      const notificationData = {
        title: newStatus === "process" ? "Dispute Processing Started" : "Dispute Status Updated",
        message: newStatus === "process" 
          ? "Your dispute is now being processed by our team."
          : `The status of your dispute has been updated to ${newStatus}.`,
        type: "alert" as const,
        severity: "info" as const,
        link: `/dispute-chat/?disputeId=${disputeId}`,
        meta: { disputeId, status: newStatus, contractStatus: contract.status }
      };

      // Notify the party who raised the dispute
      await sendNotification({
        receiverId: dispute.raisedBy._id.toString(),
        senderId: dispute.raisedTo._id.toString(),
        ...notificationData
      });

      // Notify the other party
      await sendNotification({
        receiverId: dispute.raisedTo._id.toString(),
        senderId: dispute.raisedBy._id.toString(),
        ...notificationData
      });
    } catch (notificationError) {
      console.error("Error sending notifications:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: "Dispute status updated successfully",
      dispute: {
        ...dispute.toObject(),
        contract: {
          status: contract.status,
          milestoneStatus: contract.milestones.find(
            (m: any) => m.milestoneId.toString() === dispute.milestoneId.toString()
          )?.status
        }
      }
    });

  } catch (error: any) {
    console.error("Error updating dispute status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 