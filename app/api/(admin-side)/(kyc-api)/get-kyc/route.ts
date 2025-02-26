"use server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { KYC } from "@/models/KycSchema";
import { Customer } from "@/models/CustomerSchema";

interface AggregationResult {
  _id: {
    status: "pending" | "approved" | "rejected" | "revoked";
    userType: "vendor" | "client";
  };
  count: number;
  avgTime?: number;
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get URL parameters
    const url = new URL(req.url);
    const userType = url.searchParams.get("userType") || "all"; // vendor or client
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build base query
    let query: any = {};

    // Add status filter
    if (status !== "all") {
      query.status = status;
    }

    // Get customer IDs based on userType and search
    let customerQuery: any = {};
    if (userType !== "all") {
      customerQuery.userType = userType;
    }
    if (search) {
      customerQuery.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ];
    }

    const customerIds = await Customer.find(customerQuery).select("_id");
    if (customerIds.length > 0) {
      query.customerId = { $in: customerIds };
    }

    // Get KYC submissions with pagination
    const kycs = await KYC.find(query)
      .populate("customerId", "firstName lastName email userName userType")
      .populate("verifiedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalKycs = await KYC.countDocuments(query);

    // Get statistics
    const stats = await KYC.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: {
                  status: "$status",
                  userType: "$customer.userType",
                },
                count: { $sum: 1 },
              },
            },
          ],
          todayStats: [
            {
              $match: {
                updatedAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
            {
              $group: {
                _id: {
                  status: "$status",
                  userType: "$customer.userType",
                },
                count: { $sum: 1 },
              },
            },
          ],
          averageResponseTime: [
            {
              $match: {
                status: { $in: ["approved", "rejected"] },
                verifiedAt: { $exists: true },
              },
            },
            {
              $project: {
                responseTime: {
                  $divide: [
                    { $subtract: ["$verifiedAt", "$createdAt"] },
                    1000 * 60 * 60, // Convert to hours
                  ],
                },
                userType: "$customer.userType",
              },
            },
            {
              $group: {
                _id: "$userType",
                avgTime: { $avg: "$responseTime" },
              },
            },
          ],
        },
      },
    ]);

    // Format statistics
    const formattedStats = {
      vendor: {
        pending: 0,
        approved: 0,
        rejected: 0,
        revoked: 0,
        approvedToday: 0,
        rejectedToday: 0,
        responseTime: 0,
      },
      client: {
        pending: 0,
        approved: 0,
        rejected: 0,
        revoked: 0,
        approvedToday: 0,
        rejectedToday: 0,
        responseTime: 0,
      },
    };

    // Process status counts
    stats[0].byStatus.forEach((stat: AggregationResult) => {
      if (stat._id.userType && stat._id.status) {
        formattedStats[stat._id.userType as keyof typeof formattedStats][
          stat._id.status
        ] = stat.count;
      }
    });

    // Process today's stats
    stats[0].todayStats.forEach((stat: AggregationResult) => {
      if (stat._id.userType && stat._id.status) {
        const key =
          `${stat._id.status}Today` as keyof (typeof formattedStats)[keyof typeof formattedStats];
        formattedStats[stat._id.userType as keyof typeof formattedStats][key] =
          stat.count;
      }
    });

    // Process average response times
    stats[0].averageResponseTime.forEach(
      (stat: { _id: "vendor" | "client"; avgTime: number }) => {
        if (stat._id) {
          formattedStats[stat._id].responseTime =
            Math.round(stat.avgTime * 10) / 10;
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        kycs,
        pagination: {
          total: totalKycs,
          page,
          limit,
          totalPages: Math.ceil(totalKycs / limit),
        },
        stats: formattedStats,
      },
    });
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
