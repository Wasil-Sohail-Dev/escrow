import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { ChatSystem } from "@/models/ChatSystem"; // Import ChatSystem model

interface RequestBody {
  raisedByEmail: string;
  raisedToEmail: string;
  contractId: string;
  milestoneId: string;
  title: string;
  reason: string;
  files?: { fileUrl: string; fileType: string; fileName: string }[];
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body: RequestBody = await req.json();
    const {
      raisedByEmail,
      raisedToEmail,
      contractId,
      milestoneId,
      title,
      reason,
      files,
    } = body;

    // Validate the provided email addresses
    const raisedBy = await Customer.findOne({ email: raisedByEmail });
    if (!raisedBy) {
      return NextResponse.json(
        { success: false, message: "Customer raising the dispute not found." },
        { status: 404 }
      );
    }

    const raisedTo = await Customer.findOne({ email: raisedToEmail });
    if (!raisedTo) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer against whom the dispute is raised not found.",
        },
        { status: 404 }
      );
    }

    // Check if a dispute already exists for the same contract and milestone
    const existingDispute = await Dispute.findOne({ milestoneId });
    if (existingDispute) {
      return NextResponse.json(
        {
          success: false,
          message: "A dispute has already been raised for this milestone.",
        },
        { status: 400 }
      );
    }

    // Validate contract and milestone using contractId
    const contract = await Contract.findOne({ contractId });
    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found." },
        { status: 404 }
      );
    }

    const milestone = contract.milestones.find(
      (milestone: any) => milestone.milestoneId.toString() === milestoneId
    );
    if (!milestone) {
      return NextResponse.json(
        {
          success: false,
          message: "Milestone not found in the specified contract.",
        },
        { status: 404 }
      );
    }

    // Update contract and milestone status
    contract.status = "disputed";
    milestone.status = "disputed";
    await contract.save();

    // Create the dispute
    const dispute = new Dispute({
      contractId: contract._id,
      milestoneId,
      raisedBy: raisedBy._id,
      raisedTo: raisedTo._id,
      title,
      reason,
      files,
    });

    await dispute.save();

    // **Step 1: Find or Assign an Admin**
    // const admin = await Customer.findOne({ role: "admin" }); // Ensure there's an admin
    // if (!admin) {
    //   return NextResponse.json(
    //     { success: false, message: "Admin not found for dispute chat." },
    //     { status: 500 }
    //   );
    // }

    // **Step 2: Create a Chat System Entry for Dispute**
    const chat = new ChatSystem({
      disputeId: dispute._id,
      participants: [raisedBy._id, raisedTo._id], // Both customers + Admin
      messages: [], // Empty initially
    });

    await chat.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "Dispute raised successfully. Contract and milestone status updated. Chat created.",
        disputeId: dispute.disputeId,
        chatId: chat._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
