import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { MilestoneHistory } from "@/models/MilestoneHistorySchema";
import { Customer } from "@/models/CustomerSchema";

enum MilestoneAction {
  VendorSubmitted = "vendor_submitted",
  ClientRequestedChanges = "client_requested_changes",
  ClientApproved = "client_approved", // New action for client approval
}

enum UserRole {
  Vendor = "vendor",
  Client = "client",
}

enum MilestoneStatus {
  Pending = "pending",
  Working = "working",
  ReadyForReview = "ready_for_review",
  ChangeRequested = "change_requested",
  Approved = "approved",
  PaymentReleased = "payment_released",
  Disputed = "disputed",
  DisputedInProcess = "disputed_in_process",
  DisputedResolved = "disputed_resolved",
}

interface Milestone {
  milestoneId: string;
  status: MilestoneStatus;
  title: string;
  description: string;
}

interface UpdatedMilestone extends Milestone {
  status: MilestoneStatus;
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
            "Invalid action. Must be 'vendor_submitted', 'client_requested_changes', or 'client_approved'.",
        },
        { status: 400 }
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

    if (
      action === MilestoneAction.ClientApproved &&
      customer.userType !== UserRole.Client
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only a client can approve a milestone.",
        },
        { status: 403 }
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

    // Validate milestone status before updating
    if (action === MilestoneAction.VendorSubmitted) {
      if (
        ![MilestoneStatus.Working, MilestoneStatus.ChangeRequested].includes(
          milestone.status
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Milestone must be in 'working' or 'change_requested' to submit work.",
          },
          { status: 400 }
        );
      }
    }

    if (action === MilestoneAction.ClientRequestedChanges) {
      if (milestone.status !== MilestoneStatus.ReadyForReview) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Milestone must be in 'ready_for_review' to request changes.",
          },
          { status: 400 }
        );
      }
    }

    if (action === MilestoneAction.ClientApproved) {
      if (milestone.status !== MilestoneStatus.ReadyForReview) {
        return NextResponse.json(
          {
            success: false,
            message: "Milestone must be in 'ready_for_review' to approve.",
          },
          { status: 400 }
        );
      }
    }

    // Update milestone status based on action
    contract.milestones = contract.milestones.map(
      (ms: Milestone): Milestone | UpdatedMilestone =>
        ms.milestoneId === milestoneId
          ? {
              ...ms,
              status:
                action === MilestoneAction.VendorSubmitted
                  ? MilestoneStatus.ReadyForReview
                  : action === MilestoneAction.ClientRequestedChanges
                  ? MilestoneStatus.ChangeRequested
                  : action === MilestoneAction.ClientApproved
                  ? MilestoneStatus.Approved
                  : ms.status,
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
            : action === MilestoneAction.ClientRequestedChanges
            ? "Client requested changes"
            : action === MilestoneAction.ClientApproved
            ? "Client approved"
            : ""
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
