import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract, Customer } from "@/models/Schema";
import { contractSchema } from "@/lib/zodSchema";
import { z } from "zod";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    // Validate request body using Zod
    const parsedBody = contractSchema.parse(body);

    const {
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
        { error: "Vendor not found or invalid." },
        { status: 404 }
      );
    }

    const vendorId = vendor._id;

    // Validate budget and milestones
    const milestoneSum = milestones.reduce(
      (sum, { amount }) => sum + amount,
      0
    );
    if (milestoneSum !== budget) {
      return NextResponse.json(
        {
          error: `Budget mismatch: Milestone sum (${milestoneSum}) does not match budget (${budget}).`,
        },
        { status: 400 }
      );
    }

    const newContract = new Contract({
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
      contractTemplate,
      contractFile,
    });

    const savedContract = await newContract.save();
    return NextResponse.json(
      { message: "Contract created successfully.", data: savedContract },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
