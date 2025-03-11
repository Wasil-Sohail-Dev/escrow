/**
 * The above function handles POST requests to update milestone statuses in a contract management
 * system.
 * @param {Request} req - The `req` parameter in the `POST` function represents the incoming request
 * object. It contains information about the HTTP request made to the server, such as headers, body,
 * method, and URL. In this case, it is used to extract the JSON body of the request to access the data
 * sent
 * @returns The POST function returns a JSON response with a success status, message, and an HTTP
 * status code. The response can include messages such as "Vendor submitted", "Client requested
 * changes", or "Client approved" for the milestone based on the action performed. The function handles
 * various scenarios such as validating actions, finding contracts and milestones, validating user
 * roles, updating milestone status, saving history entries, and handling errors
 */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { MilestoneHistory } from "@/models/MilestoneHistorySchema";
import { Customer } from "@/models/CustomerSchema";
import { uploadFileToS3 } from "@/lib/s3";
import { sendNotification } from "@/lib/actions/sender.action";

enum MilestoneAction {
  VendorSubmitted = "vendor_submitted",
  ClientRequestedChanges = "client_requested_changes",
  ClientApproved = "client_approved",
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

interface UploadedFile {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    
    // Extract JSON data
    const jsonData = formData.get("data");
    if (!jsonData) {
      return NextResponse.json(
        { success: false, message: "Missing milestone data." },
        { status: 400 }
      );
    }

    const body: RequestBody = JSON.parse(jsonData as string);
    const {
      contractId,
      milestoneId,
      action,
      userId,
      title,
      description,
      userRole,
    } = body;

    // Handle file uploads if present
    let uploadedFiles: UploadedFile[] = [];
    console.log(jsonData);
    const fileEntries = formData.getAll("files") as File[];
    console.log(fileEntries);
    
    if (fileEntries.length > 0) {
      try {
        const uploadPromises = fileEntries.map((file) =>
          uploadFileToS3(file, "milestones")
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedFiles = uploadResults.map(({ fileUrl, fileName }) => ({
          fileUrl,
          fileName,
          fileType: fileName.split('.').pop() || 'unknown'
        }));
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload milestone files." },
          { status: 500 }
        );
      }
    }

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

    // Ensure only the correct user role can perform the action
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
        { success: false, message: "Only a client can approve a milestone." },
        { status: 403 }
      );
    }

    // Find the milestone within the contract
    const milestone: Milestone | undefined = contract.milestones.find(
      (ms: Milestone) => ms.milestoneId === milestoneId
    );
    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found." },
        { status: 404 }
      );
    }

    // Validate milestone status before updating
    if (
      action === MilestoneAction.VendorSubmitted &&
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
    if (
      action === MilestoneAction.ClientRequestedChanges &&
      milestone.status !== MilestoneStatus.ReadyForReview
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Milestone must be in 'ready_for_review' to request changes.",
        },
        { status: 400 }
      );
    }
    if (
      action === MilestoneAction.ClientApproved &&
      milestone.status !== MilestoneStatus.ReadyForReview
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Milestone must be in 'ready_for_review' to approve.",
        },
        { status: 400 }
      );
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
    

    // Create an entry in the MilestoneHistory schema with uploaded files
    // Save the milestone history
    const historyEntry = new MilestoneHistory({
      milestoneId,
      contractId,
      action,
      files: uploadedFiles,
      title,
      description,
      userId,
      userRole,
    });
    await historyEntry.save();

      const findcontractId = await Contract.findById(contractId);
      if (!contract) {
        return NextResponse.json(
          { success: false, message: "Contract not found." },
          { status: 404 }
        );
      }

    // **📌 Send Notifications**
    try {
      if (action === MilestoneAction.VendorSubmitted) {
        await sendNotification({
          receiverId: contract.clientId.toString(),
          senderId: customer._id.toString(),
          title: "Milestone Submitted for Review",
          message: `The vendor has submitted work for milestone ${milestoneId}.`,
          type: "user",
          severity: "info",
          link: `/contact-details/${findcontractId?.contractId}`,
          meta: {
            contractId,
            milestoneId,
            newStatus: MilestoneStatus.ReadyForReview,
          },
        });
      }

      if (action === MilestoneAction.ClientRequestedChanges) {
        await sendNotification({
          receiverId: contract.vendorId.toString(),
          senderId: customer._id.toString(),
          title: "Client Requested Changes",
          message: `The client has requested changes for milestone ${milestoneId}.`,
          type: "user",
          severity: "warning",
          link: `/contact-details/${findcontractId?.contractId}`,
          meta: {
            contractId,
            milestoneId,
            newStatus: MilestoneStatus.ChangeRequested,
          },
        });
      }

      if (action === MilestoneAction.ClientApproved) {
        await sendNotification({
          receiverId: contract.vendorId.toString(),
          senderId: customer._id.toString(),
          title: "Milestone Approved",
          message: `The client has approved milestone ${milestoneId}.`,
          type: "user",
          severity: "success",
          link: `/contact-details/${findcontractId?.contractId}`,
          meta: {
            contractId,
            milestoneId,
            newStatus: MilestoneStatus.Approved,
          },
        });
      }
    } catch (notificationError) {
      console.error(
        "Error sending milestone notifications:",
        notificationError
      );
    }

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
        files: uploadedFiles
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
