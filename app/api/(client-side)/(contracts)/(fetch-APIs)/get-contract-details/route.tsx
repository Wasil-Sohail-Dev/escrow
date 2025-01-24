import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";
import { Payment } from "@/models/paymentSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const userType = searchParams.get("userType"); // "client" or "vendor"
    const limit = parseInt(searchParams.get("limit") || "1", 10);

    // Validate query parameters
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    if (!userType || (userType !== "client" && userType !== "vendor")) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid userType is required ('client' or 'vendor').",
        },
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

    // Determine the correct field to search in the Contract schema
    const field = userType === "client" ? "clientId" : "vendorId";

    // Validate that the customer exists and matches the given userType
    const customer = await Customer.findOne({ _id: customerId, userType });
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "No customer found with the provided ID and userType.",
        },
        { status: 404 }
      );
    }

    let contracts;
    if (status === 'all') {
      // For 'all' status, fetch just the latest contract from any status
      contracts = await Contract.find({
        [field]: customerId,
      })
        .populate({
          path: "vendorId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .populate({
          path: "clientId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();

      // Fetch all payments for this user regardless of contract status
      const allContracts = await Contract.find({
        [field]: customerId,
      }).lean();

      const payments = await Payment.find({
        contractId: { $in: allContracts.map(c => c._id) }
      })
        .populate({
          path: "payerId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .populate({
          path: "payeeId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .populate({
          path: "contractId",
          select: "title contractId",
          model: Contract,
        })
        .lean();

      // Add contract title to payments
      const paymentsWithTitle = payments.map(payment => ({
        ...payment,
        contractTitle: payment.contractId.title
      }));

      return NextResponse.json(
        {
          success: true,
          data: {
            totalContracts: allContracts.length,
            contracts,
            latestContract: contracts[0],
            payments: paymentsWithTitle,
          },
        },
        { status: 200 }
      );
    } else {
      // For specific status, fetch all contracts with that status
      contracts = await Contract.find({
        [field]: customerId,
        status,
      })
        .populate({
          path: "vendorId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .populate({
          path: "clientId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .sort({ createdAt: -1 })
        .lean();

      if (!contracts.length) {
        return NextResponse.json({
          success: false,
          message: "No contracts found for the given customer and status.",
        });
      }

      // Fetch payments for contracts with specific status
      const payments = await Payment.find({
        contractId: { $in: contracts.map(c => c._id) }
      })
        .populate({
          path: "payerId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .populate({
          path: "payeeId",
          select: "email userName firstName lastName userType",
          model: Customer,
        })
        .populate({
          path: "contractId",
          select: "title contractId",
          model: Contract,
        })
        .lean();

      // Add contract title to payments
      const paymentsWithTitle = payments.map(payment => ({
        ...payment,
        contractTitle: payment.contractId.title
      }));

      return NextResponse.json(
        {
          success: true,
          data: {
            totalContracts: contracts.length,
            contracts,
            latestContract: contracts[0],
            payments: paymentsWithTitle,
          },
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}