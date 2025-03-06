import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const customerId = searchParams.get("customerId");
    const role = searchParams.get("role"); // "client" or "vendor"
    const status = searchParams.get("status") || "all"; // Contract status filter
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Default limit: 10
    const page = parseInt(searchParams.get("page") || "1", 10); // Default page: 1
    const sortOrder = searchParams.get("sort") === "asc" ? 1 : -1; // "asc" or "desc"
    const searchTerm = searchParams.get("search") || ""; // Search term
    const startDate = searchParams.get("startDate"); // Date range filter
    const endDate = searchParams.get("endDate"); // Date range filter

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

    // Verify customer exists
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

    // Determine the query field based on role
    const queryField = role === "client" ? "clientId" : "vendorId";

    // Build the contract query with optional status filter and search
    const contractQuery: any = { [queryField]: customerId };
    
    // Add status filter
    if (status !== "all") {
      contractQuery.status = status;
    }

    // Add date range filter if both dates are provided
    if (startDate && endDate) {
      contractQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      contractQuery.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      contractQuery.createdAt = { $lte: new Date(endDate) };
    }

    // Add search functionality
    if (searchTerm) {
      contractQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { contractId: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Fetch paginated contracts
    const contracts = await Contract.find(contractQuery)
      .populate([
        { path: "clientId", select: "userName email" },
        { path: "vendorId", select: "userName email" },
      ])
      .sort({ createdAt: sortOrder }) // Sort by createdAt (latest or oldest)
      .skip((page - 1) * limit) // Skip for pagination
      .limit(limit); // Apply limit

    // Get total count for pagination info
    const totalContracts = await Contract.countDocuments(contractQuery);

    // Calculate and transform contracts with completion percentage
    const contractsWithPercentage = contracts.map((contract) => {
      const totalMilestones = contract.milestones.length;
      const completedMilestones = contract.milestones.filter(
        (milestone: any) => milestone.status === "approved"
      ).length;
      const completionPercentage = totalMilestones > 0 
        ? (completedMilestones / totalMilestones) * 100 
        : 0;

      return {
        ...contract.toObject(),
        completionPercentage: Math.round(completionPercentage)
      };
    });

    return NextResponse.json(
      {
        message: "Contracts retrieved successfully.",
        data: contractsWithPercentage,
        pagination: {
          total: totalContracts,
          page,
          limit,
          totalPages: Math.ceil(totalContracts / limit),
        },
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
