import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/paymentSchema";
import mongoose from "mongoose";
import { Contract } from "@/models/ContractSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const userType = searchParams.get("userType");
    const contractId = searchParams.get("contractId");

    // Validate required parameters
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    if (!userType || !["client", "vendor"].includes(userType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid userType ('client' or 'vendor') is required.",
        },
        { status: 400 }
      );
    }

    // Initialize query filter
    const filter: any = {
      [`${userType === "client" ? "payerId" : "payeeId"}`]:
        new mongoose.Types.ObjectId(customerId),
    };

    // Validate and add contractId to the filter if provided
    if (contractId) {
      if (!mongoose.Types.ObjectId.isValid(contractId)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid contractId format: ${contractId}`,
          },
          { status: 400 }
        );
      }
      filter.contractId = new mongoose.Types.ObjectId(contractId); // Cast to ObjectId
    }

    // Fetch payments based on the constructed filter
    const payments = await Payment.find(filter)
      .populate("payerId", "email userName firstName lastName userType") // Populate payer info
      .populate("payeeId", "email userName firstName lastName userType") // Populate payee info
      .lean();
    if (!payments || payments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No payments found for the given parameters.",
        },
        { status: 404 }
      );
    }
    let contract:any;
    if(contractId){
    // Fetch contract title
    contract = await Contract.findById(contractId).select("title").lean();

    if(!contract){
      return NextResponse.json(
        {
          success: false,
          message: "Contract not found.",
        },
        { status: 404 }
      );
    }
  }

    // Add type assertion to specify contract structure
    const paymentsWithTitle = payments.map(payment => ({
      ...payment,
      contractTitle: (contract as { title?: string })?.title || "Untitled Contract"
    }));
    // Return success response with payments
    return NextResponse.json(
      {
        success: true,
        data: contractId ? paymentsWithTitle : payments,
        totalPayments: payments.length, // Total number of payments found
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
