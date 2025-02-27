import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";

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

    // Validate status transition
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return NextResponse.json(
        { success: false, error: "Dispute not found" },
        { status: 404 }
      );
    }

    const allowedNextStatuses = validTransitions[dispute.status as DisputeStatus];
    if (!allowedNextStatuses.includes(newStatus as DisputeStatus)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from ${dispute.status} to ${newStatus}` },
        { status: 400 }
      );
    }

    // Update dispute status
    dispute.status = newStatus;
    await dispute.save();

    return NextResponse.json({
      success: true,
      message: "Dispute status updated successfully",
      dispute
    });

  } catch (error) {
    console.error("Error updating dispute status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 