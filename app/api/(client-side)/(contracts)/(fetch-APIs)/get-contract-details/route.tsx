import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";
import { Payment } from "@/models/paymentSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "1", 10);

    // Validate query parameters
    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Contract ID is required." },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required." },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        { success: false, message: "Limit must be a positive integer." },
        { status: 400 }
      );
    }

    // Fetch the total number of contracts
    const totalContracts = await Contract.countDocuments({ _id: contractId });

    // Fetch the total number of contracts with the given status
    const totalContractsWithStatus = await Contract.countDocuments({ status });

    // Fetch contracts matching the criteria and populate vendorId
    const contracts = await Contract.find({
      _id: contractId,
      status,
    })
      .populate({
        path: "vendorId",
        select: "email userName firstName lastName userType", // Populate only email and userName
        model: Customer,
      })
      .limit(limit)
      .lean();

    if (contracts.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No contracts found.",
      });
    }

    // Fetch payment data related to the contractId
    const payments = await Payment.find({ contractId })
      .populate({
        path: "payerId",
        select: "email userName firstName lastName userType", // Populate only email and userName
        model: Customer,
      })
      .populate({
        path: "payeeId",
        select: "email userName firstName lastName userType", // Populate only email and userName
        model: Customer,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          totalContracts,
          totalContractsWithStatus,
          contracts,
          payments,
        },
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
