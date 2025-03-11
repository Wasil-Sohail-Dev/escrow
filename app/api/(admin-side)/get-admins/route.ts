import { NextResponse } from "next/server";
import { Admin } from "@/models/AdminSchema";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};

    // Add status filter if specified
    if (status !== "all") {
      query.userStatus = status;
    }

    // Add search filter if specified
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Exclude super_admin from results for security
    query.userType = { $ne: "super_admin" };

    // Fetch admins with pagination
    const [admins, total] = await Promise.all([
      Admin.find(query)
        .select("-password") // Exclude password field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Admin.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: admins,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admins" },
      { status: 500 }
    );
  }
} 