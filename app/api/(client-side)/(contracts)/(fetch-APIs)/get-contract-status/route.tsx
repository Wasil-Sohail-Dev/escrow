import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const role = searchParams.get("role"); // "client" or "vendor"
    const status = searchParams.get("status"); // Contract status or "all"
    const limit = parseInt(searchParams.get("limit") || "0", 10); // Number of contracts to return
    const sort = searchParams.get("sort") || "desc"; // "asc" or "desc"

    // Validate query parameters
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

    // Check if the customer exists in the database with the correct role
    const customer = await Customer.findOne({
      _id: new mongoose.Types.ObjectId(customerId),
      userType: role,
    });

    if (!customer) {
      return NextResponse.json(
        { error: `No ${role} found with the provided ID: ${customerId}` },
        { status: 404 }
      );
    }

    // Determine the query field based on the role
    const queryField = role === "client" ? "clientId" : "vendorId";

    // Build the query for fetching contracts
    const query: Record<string, any> = {
      [queryField]: customerId,
    };

    // If status is not "all" or empty, filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Fetch contracts with sorting and limiting
    const contracts = await Contract.find(query)
      .sort({ createdAt: sort === "asc" ? 1 : -1 }) // Sort by createdAt
      .limit(limit > 0 ? limit : 0); // Apply limit if provided

    if (contracts.length === 0) {
      return NextResponse.json(
        {
          message: `No contracts found ${
            status && status !== "all" ? `with status "${status}"` : ""
          } for the provided customer.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Contracts retrieved successfully.",
        data: contracts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
