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
    const limit = 5; // Force limit to always be 5
    const page = parseInt(searchParams.get("page") || "1", 10); // Default page: 1
    const sort = searchParams.get("sort") || "desc"; // "asc" or "desc"
    const searchTerm = searchParams.get("search") || ""; // Search term
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const projectFilter = searchParams.get("project"); // Project title filter

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

    // Add status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Add search functionality
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { contractId: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Add project filter
    if (projectFilter && projectFilter !== "All Projects") {
      query.title = projectFilter;
    }

    // Get total count for pagination
    const totalContracts = await Contract.countDocuments(query);

    // Fetch contracts with sorting and pagination
    const contracts = await Contract.find(query)
      .populate([
        { path: "clientId", select: "userName email" },
        { path: "vendorId", select: "userName email" },
      ])
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get unique project titles for filter options
    const allProjects = await Contract.distinct('title', {
      [queryField]: customerId,
      status: status !== "all" ? status : { $exists: true }
    });

    return NextResponse.json(
      {
        message: "Contracts retrieved successfully.",
        data: contracts,
        pagination: {
          total: totalContracts,
          page,
          limit,
          totalPages: Math.ceil(totalContracts / limit),
        },
        filterOptions: {
          projects: ["All Projects", ...allProjects]
        }
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
