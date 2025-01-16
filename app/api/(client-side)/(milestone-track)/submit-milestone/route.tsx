import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { MilestoneHistory } from "@/models/MilestoneHistorySchema";
import { Customer } from "@/models/CustomerSchema";

enum MilestoneAction {
  VendorSubmitted = "vendor_submitted",
  ClientRequestedChanges = "client_requested_changes",
}

enum UserRole {
  Vendor = "vendor",
  Client = "client",
}

interface Milestone {
  milestoneId: string;
  status: string;
  title: string;
  description: string;
  // Add other properties of Milestone if needed
}

// Update the milestone status safely
interface UpdatedMilestone extends Milestone {
  status: string;
}

interface RequestBody {
  contractId: string;
  milestoneId: string;
  action: MilestoneAction;
  userId: string;
  files?: { fileUrl: string; fileType: string; fileName: string }[];
  title?: string;
  description?: string;
  userRole: UserRole;
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body: RequestBody = await req.json();
    const {
      contractId,
      milestoneId,
      action,
      userId,
      files,
      title,
      description,
      userRole,
    } = body;

    // Validate action
    if (!Object.values(MilestoneAction).includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid action. Must be 'vendor_submitted' or 'client_requested_changes'.",
        },
        { status: 400 }
      );
    }

    // Validate user role
    const customer = await Customer.findById(userId);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found." },
        { status: 404 }
      );
    }

    if (
      action === MilestoneAction.VendorSubmitted &&
      customer.userType !== UserRole.Vendor
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only a vendor can submit work for a milestone.",
        },
        { status: 403 }
      );
    }

    if (
      action === MilestoneAction.ClientRequestedChanges &&
      customer.userType !== UserRole.Client
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only a client can request changes for a milestone.",
        },
        { status: 403 }
      );
    }

    // Find the contract and milestone
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found." },
        { status: 404 }
      );
    }

    const milestone: Milestone | undefined = contract.milestones.find(
      (ms: Milestone) => ms.milestoneId === milestoneId
    );
    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found." },
        { status: 404 }
      );
    }

    // Ensure milestone belongs to this contract
    if (
      !contract.milestones.some(
        (ms: Milestone) => ms.milestoneId === milestoneId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Milestone does not belong to the specified contract.",
        },
        { status: 400 }
      );
    }

    // Update milestone status
    contract.milestones = contract.milestones.map(
      (ms: Milestone): Milestone | UpdatedMilestone =>
        ms.milestoneId === milestoneId
          ? {
              ...ms,
              status:
                action === MilestoneAction.VendorSubmitted
                  ? "ready_for_review"
                  : "change_requested",
            }
          : ms
    );

    await contract.save();

    // Create an entry in the MilestoneHistory schema
    const historyEntry = new MilestoneHistory({
      milestoneId,
      contractId,
      action,
      files, // Files uploaded (if any)
      title, // Title of the action
      description, // Notes or feedback from the vendor or client
      userId,
      userRole,
    });
    await historyEntry.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `${
          action === MilestoneAction.VendorSubmitted
            ? "Vendor submitted"
            : "Client requested changes"
        } for the milestone.`,
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
