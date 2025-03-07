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

    // Define valid contract statuses from schema
    const validContractStatuses = [
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
      "disputed_resolved"
    ];

    // Build the contract query with optional status filter and search
    const contractQuery: any = { [queryField]: customerId };
    
    // Add status filter with validation
    if (status !== "all") {
      if (!validContractStatuses.includes(status)) {
        return NextResponse.json(
          { 
            error: `Invalid status. Status must be one of: ${validContractStatuses.join(', ')} or 'all'` 
          },
          { status: 422 }
        );
      }
      contractQuery.status = status;
    }

    // Add date range filter if both dates are provided
    if (startDate && endDate) {
      contractQuery.$or = [
        // Contract's start date falls within the range
        {
          startDate: {
            $gte: new Date(startDate),
          }
        },
        // Contract's end date falls within the range
        {
          endDate: {
            $lte: new Date(endDate)
          }
        },
        // Contract spans across the entire selected range
        {
          $and: [
            { startDate: { $lte: new Date(startDate) } },
            { endDate: { $gte: new Date(endDate) } }
          ]
        }
      ];
    } else if (startDate) {
      // If only start date is provided, show contracts starting from that date
      contractQuery.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      // If only end date is provided, show contracts ending before that date
      contractQuery.endDate = { $lte: new Date(endDate) };
    }

    // Add search functionality
    if (searchTerm) {
      // If we already have date filters in $or, we need to use $and to combine with search
      const searchConditions = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { contractId: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];

      if (contractQuery.$or) {
        contractQuery.$and = [
          { $or: contractQuery.$or },
          { $or: searchConditions }
        ];
        delete contractQuery.$or;
      } else {
        contractQuery.$or = searchConditions;
      }
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

      if(!contracts){
        return NextResponse.json(
          { error: "No contracts found." },
          { status: 404 }
        );
      }

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
