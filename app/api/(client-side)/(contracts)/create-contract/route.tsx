import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { contractSchema } from "@/lib/zodSchema";
import { z } from "zod";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { uploadFileToS3 } from "@/lib/s3";
import { sendContractInvite } from "@/mail-system/sendMail";
import { sendNotification } from "@/lib/actions/sender.action";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();

    // Extract JSON fields from FormData
    const jsonData = formData.get("data") as string;
    if (!jsonData) {
      return NextResponse.json(
        { error: "Missing contract data." },
        { status: 400 }
      );
    }

    const body = JSON.parse(jsonData);
    const parsedBody = contractSchema.parse(body);

    const {
      contractId,
      contractType,
      clientEmail,
      title,
      description,
      vendorEmail,
      budget,
      paymentType,
      milestones,
      startDate,
      endDate,
      contractTemplate,
    } = parsedBody;

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required." },
        { status: 422 }
      );
    }

    // Ensure contractId is unique
    const existingContract = await Contract.findOne({ contractId });
    if (existingContract) {
      return NextResponse.json(
        {
          error:
            "contractId must be unique. A contract with this ID already exists.",
        },
        { status: 422 }
      );
    }

    // Ensure startDate is before endDate
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "Start date must be before end date." },
        { status: 422 }
      );
    }

    if (budget <= 0) {
      return NextResponse.json(
        { error: "Budget must be greater than 0." },
        { status: 422 }
      );
    }

    const [client, vendor] = await Promise.all([
      Customer.findOne({ email: clientEmail, userType: "client" }),
      Customer.findOne({ email: vendorEmail, userType: "vendor" }),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }
    if (!vendor) {
      return NextResponse.json(
        { error: `Vendor not found: ${vendorEmail}` },
        { status: 404 }
      );
    }

    const vendorId = vendor._id;

    if (milestones.length === 0) {
      return NextResponse.json(
        { error: "At least one milestone is required." },
        { status: 422 }
      );
    }

    const milestoneSum = milestones.reduce(
      (sum, { amount }) => sum + amount,
      0
    );
    if (milestoneSum !== budget) {
      return NextResponse.json(
        {
          error: `Milestone sum (${milestoneSum}) does not match budget (${budget}).`,
        },
        { status: 422 }
      );
    }

    // Upload files to S3 and get URLs
    const contractFiles = formData.getAll("contractFiles") as File[];

    console.log(contractFiles, "contractFiles");

    const uploadedFiles = await Promise.all(
      contractFiles.map(async (file) => {
        const { fileUrl, fileName } = await uploadFileToS3(file);
        return {
          fileUrl,
          fileName,
          fileType: fileName.split('.').pop() || 'unknown'
        };
      })
    );

    // Create a new contract record
    const newContract = new Contract({
      contractId,
      contractType,
      title,
      description,
      clientId: client._id,
      vendorId,
      vendorEmail,
      budget,
      paymentType,
      milestones,
      startDate,
      endDate,
      status: "onboarding",
      contractTemplate,
      contractFile: uploadedFiles, // Store file objects with URLs and names
    });

    const savedContract = await newContract.save();

    // Send contract invite email to vendor
    try {
      await sendContractInvite(
        savedContract.contractId,
        vendorEmail,
        clientEmail
      );
    } catch (emailError) {
      console.error("Error sending contract invite email:", emailError);
    }

    // **📌 Send Notification to Vendor**
    try {
      await sendNotification({
        receiverId: vendorId.toString(),
        senderId: client._id.toString(),
        title: "New Contract Assigned",
        message: `A new contract (${title}) has been assigned to you.`,
        type: "user",
        severity: "info",
        link: `/contact-details/${contractId}`, // Redirect to contract details page
        meta: { contractId },
      });
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
    }

    return NextResponse.json(
      {
        message: "Contract created successfully and invitation sent.",
        data: savedContract,
      },
      { status: 200 }
    );
  } catch (error: any) {

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message) },
        { status: 422 }
      );
    }

    console.error("Error creating contract:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
