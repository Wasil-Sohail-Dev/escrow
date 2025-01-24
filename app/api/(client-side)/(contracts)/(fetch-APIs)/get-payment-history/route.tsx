import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/paymentSchema";
import { Contract } from "@/models/ContractSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    // Validate contractId
    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Contract ID is required." },
        { status: 400 }
      );
    }

    // Fetch payment history for the contract and populate payerId and payeeId
    const payments = await Payment.find({ contractId })
      .populate("payerId", "email userName") // Populate payer info
      .populate("payeeId", "email userName") // Populate payee info
      .lean();

    // Check if payments exist
    if (!payments || payments.length === 0) {
      return NextResponse.json(
        { success: false, message: "No payments found for this contract." },
        { status: 404 }
      );
    }

    // Fetch contract title
    const contract = await Contract.findById(contractId).select("title").lean();
    console.log(contract,"contractcontractcontract");
    // Add type assertion to specify contract structure
    const paymentsWithTitle = payments.map(payment => ({
      ...payment,
      contractTitle: (contract as { title?: string })?.title || "Untitled Contract"
    }));

    // Return success response with payments
    return NextResponse.json(
      {
        success: true,
        data: paymentsWithTitle,
        totalPayments: payments.length, // Total number of payments for the contract
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
