import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";
import { Dispute } from "@/models/DisputeSchema";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const role = searchParams.get("role"); // Role can be "client" or "vendor"

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required as a query parameter." },
        { status: 422 }
      );
    }

    if (!role || (role !== "client" && role !== "vendor")) {
      return NextResponse.json(
        { error: 'role is required and must be either "client" or "vendor".' },
        { status: 422 }
      );
    }

    const customer = await Customer.findOne({
      _id: customerId,
      userType: role,
    });

    if (!customer) {
      return NextResponse.json(
        { error: `No ${role} found with the provided ID: ${customerId}` },
        { status: 404 }
      );
    }

    const queryField = role === "client" ? "clientId" : "vendorId";

    const statuses = [
      "draft",
      "onboarding",
      "funding_pending",
      "funding_processing",
      "funding_onhold",
      "active",
      "in_review",
      "completed",
      "cancelled",
      "disputed",
      "disputed_in_process",
      "disputed_resolved",
    ];

    const contractCounts = await Contract.aggregate([
      {
        $match: { [queryField]: new mongoose.Types.ObjectId(customerId) }, // Ensure ObjectId type
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    if (contractCounts.length === 0) {
      console.warn("No contracts found for the provided customerId and role:", {
        customerId,
        queryField,
      });
    }

    const counts = statuses.reduce((acc: { [key: string]: number }, status) => {
      const found = contractCounts.find((c) => c._id === status);
      acc[status] = found ? found.count : 0;
      return acc;
    }, {});

    // Handle unexpected statuses
    const unexpectedStatuses = contractCounts.filter(
      (c) => !statuses.includes(c._id)
    );

    if (unexpectedStatuses.length > 0) {
      console.warn("Unexpected statuses found:", unexpectedStatuses);
    }

    const totalContracts = await Contract.countDocuments({
      [queryField]: customerId,
    });

    // Get dispute resolution count
    const disputeQuery = role === "client" ? { raisedBy: customerId } : { raisedTo: customerId };
    const resolvedDisputeCount = await Dispute.countDocuments({
      ...disputeQuery,
      status: "resolved"
    });

    return NextResponse.json(
      {
        message: "Contract counts retrieved successfully.",
        data: {
          ...counts,
          totalContracts,
          resolvedDisputes: resolvedDisputeCount
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching contract counts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
