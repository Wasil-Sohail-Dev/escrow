import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const role = searchParams.get("role"); // Role can be "client" or "vendor"

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
      _id: customerId,
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

    // Fetch contracts from the database
    const contracts = await Contract.find({
      [queryField]: customerId,
    }).populate([
      { path: "clientId", select: "userName email" },
      { path: "vendorId", select: "userName email" },
    ]);

    if (!contracts.length) {
      return NextResponse.json(
        { error: `No contracts found for the given ${role} ID: ${customerId}` },
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
