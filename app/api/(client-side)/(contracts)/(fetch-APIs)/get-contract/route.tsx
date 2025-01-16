import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    // Check if contractId is provided
    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required as a query parameter." },
        { status: 422 }
      );
    }

    // Fetch the contract from the database
    const contract = await Contract.findOne({ contractId }).populate([
      { path: "clientId", select: "userName email" }, // Populate client details
      { path: "vendorId", select: "userName email" }, // Populate vendor details
    ]);

    if (!contract) {
      return NextResponse.json(
        { error: `No contract found with contractId: ${contractId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Contract details retrieved successfully.",
        data: contract,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching contract details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
