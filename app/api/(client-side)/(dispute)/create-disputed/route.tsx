import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { ChatSystem } from "@/models/ChatSystem";
import { sendNotification } from "@/lib/actions/sender.action";
import { uploadFileToS3 } from "@/lib/s3";
import { Admin } from "@/models/AdminSchema";
import mongoose from "mongoose";

interface RequestBody {
  raisedByEmail: string;
  raisedToEmail: string;
  contractId: string;
  milestoneId: string;
  title: string;
  reason: string;
}

export async function POST(req: Request) {
  console.log("Creating dispute");
  await dbConnect();

  try {
    const formData = await req.formData();
    console.log(formData, "formData");
    // Extract JSON fields from FormData
    const jsonData = formData.get("data") as string;
    if (!jsonData) {
      return NextResponse.json(
        { success: false, message: "Missing dispute data." },
        { status: 400 }
      );
    }

    const body: RequestBody = JSON.parse(jsonData);
    const {
      raisedByEmail,
      raisedToEmail,
      contractId,
      milestoneId,
      title,
      reason,
    } = body;

    // Validate provided email addresses
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

    // Validate contract and milestone
    const contract = await Contract.findOne({ contractId });
    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found." },
        { status: 404 }
      );
    }

    // Check if a dispute already exists for this contract and milestone
    const existingDispute = await Dispute.findOne({
      $and: [
        { contractId: contract._id },
        { milestoneId: { $regex: new RegExp(milestoneId, 'i') } }
      ]
    }).lean();

    if (existingDispute) {
      return NextResponse.json(
        {
          success: false,
          message: "A dispute has already been raised for this milestone.",
        },
        { status: 400 }
      );
    }

    const milestone = contract.milestones.find(
      (m: any) => m.milestoneId === milestoneId
    );
    if (!milestone) {
      return NextResponse.json(
        { success: false, message: "Milestone not found in the contract." },
        { status: 404 }
      );
    }

    // Handle file uploads (if present)
    let uploadedFiles: {
      fileUrl: string;
      fileName: string;
      fileType: string;
    }[] = [];
    const fileEntries = formData.getAll("files") as File[];

    if (fileEntries.length > 0) {
      try {
        const uploadPromises = fileEntries.map((file) =>
          uploadFileToS3(file, "disputes")
        );
        const uploadResults = await Promise.all(uploadPromises);

        uploadedFiles = uploadResults.map(({ fileUrl, fileName }) => ({
          fileUrl,
          fileName,
          fileType: fileName.split(".").pop() || "unknown",
        }));
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload dispute files." },
          { status: 500 }
        );
      }
    }

    // Update contract and milestone status
    contract.status = "disputed";
    milestone.status = "disputed";
    await contract.save();

    // Generate dispute ID
    const count = await Dispute.countDocuments();
    const generatedDisputeId = `DSP${String(count + 1).padStart(6, "0")}`;

    // Create the dispute
    const disputeData = {
      contractId: contract._id,
      milestoneId: milestone.milestoneId,
      raisedBy: raisedBy._id,
      raisedTo: raisedTo._id,
      title,
      reason,
      files: uploadedFiles,
      disputeId: generatedDisputeId
    };

    const dispute = await Dispute.create(disputeData);

    // Find or Assign an Admin
    const admin = await Admin.findOne({ userType: "super_admin" });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found for dispute chat." },
        { status: 500 }
      );
    }

    // Create a Chat System Entry for Dispute
    const chat = await ChatSystem.create({
      disputeId: dispute._id,
      participants: [raisedBy._id, raisedTo._id, admin._id],
      participantTypes: ['Customer', 'Customer', 'Admin'],
      messages: [],
      lastMessage: "",
      lastMessageAt: new Date()
    });

    // Send Notifications
    try {
      // Notify the opposing party
      await sendNotification({
        receiverId: raisedTo._id.toString(),
        senderId: raisedBy._id.toString(),
        title: "New Dispute Raised",
        message: `A dispute has been raised for milestone ${milestoneId} under contract ${contractId}.`,
        type: "alert",
        severity: "warning",
        link: `/dispute-management-screen?contractId=${contractId}`,
        meta: { disputeId: dispute._id.toString(), contractId, milestoneId },
      });
    } catch (notificationError) {
      console.error("Error sending dispute notifications:", notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Dispute raised successfully. Files uploaded. Chat created. Notifications sent.",
        disputeId: dispute._id,
        chatId: chat._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating dispute:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
