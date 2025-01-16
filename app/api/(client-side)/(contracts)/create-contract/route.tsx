import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { contractSchema } from "@/lib/zodSchema";
import { z } from "zod";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { sendContractInvite } from "@/mail-system/sendMail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    // Validate request body using Zod
    const parsedBody = contractSchema.parse(body);

    const {
      contractId,
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
      contractFile,
    } = parsedBody;

    // Check if contractId is provided
    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required." },
        { status: 422 }
      );
    }

    // Ensure startDate is before endDate
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "Invalid dates: Start date must be before end date." },
        { status: 422 }
      );
    }

    // Budget must be a positive number
    if (budget <= 0) {
      return NextResponse.json(
        { error: "Invalid budget: Budget must be greater than 0." },
        { status: 422 }
      );
    }

    // Fetch client and vendor data
    const [client, vendor] = await Promise.all([
      Customer.findOne({ email: clientEmail, userType: "client" }),
      Customer.findOne({ email: vendorEmail, userType: "vendor" }),
    ]);

    if (!client || client.userType !== "client") {
      return NextResponse.json(
        { error: "Unauthorized: Only clients can perform this action." },
        { status: 403 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { error: `Vendor not found for email: ${vendorEmail}` },
        { status: 404 }
      );
    }

    const vendorId = vendor._id;

    if (milestones.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid milestones: At least one milestone is required.",
        },
        { status: 422 }
      );
    }

    // Validate milestones
    const milestoneSum = milestones.reduce(
      (sum, { amount }) => sum + amount,
      0
    );
    if (milestoneSum !== budget) {
      return NextResponse.json(
        {
          error: `Budget mismatch: Milestone sum (${milestoneSum}) does not match budget (${budget}).`,
        },
        { status: 422 }
      );
    }

    // Update the existing contract
    // Create a new contract record based on the existing contract
    const newContract = new Contract({
      contractId, // Ensure a new unique contractId
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
      contractFile,
    });

    // Save the new contract
    const savedContract = await newContract.save();

    // Optionally send an updated contract invite to the vendor
    try {
      await sendContractInvite(
        savedContract.contractId,
        vendorEmail,
        clientEmail
      );
    } catch (emailError) {
      console.error("Error sending contract update invite email:", emailError);
    }

    return NextResponse.json(
      {
        message: "Contract updated successfully and invitation sent.",
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

    console.error("Error updating contract:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}