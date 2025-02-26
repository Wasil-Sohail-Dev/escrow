import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get URL parameters
    const url = new URL(req.url);
    const userType = url.searchParams.get("userType") || "all"; // client, vendor, or all
    const userStatus = url.searchParams.get("userStatus") || "all";
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Base query
    let query: any = {};

    // Add userType filter if specified
    if (userType !== "all") {
      query.userType = userType;
    }

    // Add userStatus filter if specified
    if (userStatus !== "all") {
      query.userStatus = userStatus;
    }

    // Add search filter if specified
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get customers with pagination
    const customers = await Customer.find(query)
      .select("-password -onboardingToken -tokenExpiresAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get customer IDs for detailed stats
    const customerIds = customers.map(customer => customer._id);

    // Get per-customer contract statistics
    const customerProjects = await Contract.aggregate([
      {
        $match: {
          clientId: { $in: customerIds }
        }
      },
      {
        $group: {
          _id: "$clientId",
          activeProjects: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0]
            }
          },
          completedProjects: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get per-customer revenue statistics
    const customerRevenue = await Payment.aggregate([
      {
        $match: {
          payerId: { $in: customerIds },
          status: { $in: ["funded", "partially_released", "fully_released"] }
        }
      },
      {
        $group: {
          _id: "$payerId",
          currentMonthRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", new Date(new Date().setDate(1))] },
                    { $lte: ["$createdAt", new Date()] }
                  ]
                },
                "$totalAmount",
                0
              ]
            }
          },
          lastMonthRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", new Date(new Date().setMonth(new Date().getMonth() - 1, 1))] },
                    { $lte: ["$createdAt", new Date(new Date().setDate(0))] }
                  ]
                },
                "$totalAmount",
                0
              ]
            }
          }
        }
      }
    ]);

    // Enhance customer data with projects and revenue
    const enhancedCustomers = customers.map(customer => {
      const customerProjectStats = customerProjects.find(
        stats => stats._id.toString() === customer._id.toString()
      ) || { activeProjects: 0, completedProjects: 0 };

      const customerRevenueStats = customerRevenue.find(
        stats => stats._id.toString() === customer._id.toString()
      ) || { currentMonthRevenue: 0, lastMonthRevenue: 0 };

      const revenueGrowth = customerRevenueStats.lastMonthRevenue === 0 ? 0 :
        ((customerRevenueStats.currentMonthRevenue - customerRevenueStats.lastMonthRevenue) / 
        customerRevenueStats.lastMonthRevenue) * 100;

      return {
        ...customer.toObject(),
        projects: {
          active: customerProjectStats.activeProjects,
          completed: customerProjectStats.completedProjects
        },
        revenue: {
          current: customerRevenueStats.currentMonthRevenue,
          growth: Math.round(revenueGrowth * 100) / 100
        }
      };
    });

    // Get total count for pagination
    const totalCustomers = await Customer.countDocuments(query);

    // Get contract statistics
    const contractStats = await Contract.aggregate([
      {
        $facet: {
          activeContracts: [
            {
              $match: {
                status: "active"
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ],
          completedContracts: [
            {
              $match: {
                status: "completed"
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Get revenue statistics
    const revenueStats = await Payment.aggregate([
      {
        $facet: {
          currentMonthRevenue: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(1)), // First day of current month
                  $lte: new Date()
                },
                status: { $in: ["funded", "partially_released", "fully_released"] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" }
              }
            }
          ],
          lastMonthRevenue: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), // First day of last month
                  $lte: new Date(new Date().setDate(0)) // Last day of last month
                },
                status: { $in: ["funded", "partially_released", "fully_released"] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" }
              }
            }
          ]
        }
      }
    ]);

    // Calculate revenue growth percentage
    const currentMonthRevenue = revenueStats[0].currentMonthRevenue[0]?.total || 0;
    const lastMonthRevenue = revenueStats[0].lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRevenue === 0 ? 100 : 
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // Get statistics
    const stats = await Customer.aggregate([
      {
        $facet: {
          clientStats: [
            { $match: { userType: "client" } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                  $sum: {
                    $cond: [{ $eq: ["$userStatus", "active"] }, 1, 0],
                  },
                },
                blocked: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ["$userStatus", "adminInactive"] },
                          { $eq: ["$userStatus", "userInactive"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pendingVerification: {
                  $sum: {
                    $cond: [{ $eq: ["$userStatus", "pendingVerification"] }, 1, 0],
                  },
                },
              },
            },
          ],
          vendorStats: [
            { $match: { userType: "vendor" } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                  $sum: {
                    $cond: [{ $eq: ["$userStatus", "active"] }, 1, 0],
                  },
                },
                blocked: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ["$userStatus", "adminInactive"] },
                          { $eq: ["$userStatus", "userInactive"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pendingVerification: {
                  $sum: {
                    $cond: [{ $eq: ["$userStatus", "pendingVerification"] }, 1, 0],
                  },
                },
              },
            },
          ],
          monthlyGrowth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                },
              },
            },
            {
              $group: {
                _id: "$userType",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // Format statistics
    const formattedStats = {
      clients: {
        total: stats[0].clientStats[0]?.total || 0,
        active: stats[0].clientStats[0]?.active || 0,
        blocked: stats[0].clientStats[0]?.blocked || 0,
        pendingVerification: stats[0].clientStats[0]?.pendingVerification || 0,
        monthlyGrowth: stats[0].monthlyGrowth.find((g: any) => g._id === "client")?.count || 0,
      },
      vendors: {
        total: stats[0].vendorStats[0]?.total || 0,
        active: stats[0].vendorStats[0]?.active || 0,
        blocked: stats[0].vendorStats[0]?.blocked || 0,
        pendingVerification: stats[0].vendorStats[0]?.pendingVerification || 0,
        monthlyGrowth: stats[0].monthlyGrowth.find((g: any) => g._id === "vendor")?.count || 0,
      },
      overall: {
        total: (stats[0].clientStats[0]?.total || 0) + (stats[0].vendorStats[0]?.total || 0),
        active: (stats[0].clientStats[0]?.active || 0) + (stats[0].vendorStats[0]?.active || 0),
        blocked: (stats[0].clientStats[0]?.blocked || 0) + (stats[0].vendorStats[0]?.blocked || 0),
        pendingVerification: (stats[0].clientStats[0]?.pendingVerification || 0) + (stats[0].vendorStats[0]?.pendingVerification || 0),
        monthlyGrowth: stats[0].monthlyGrowth.reduce((acc: number, curr: any) => acc + curr.count, 0),
      },
      projects: {
        active: contractStats[0].activeContracts[0]?.count || 0,
        completed: contractStats[0].completedContracts[0]?.count || 0
      },
      revenue: {
        current: currentMonthRevenue,
        growth: Math.round(revenueGrowth * 100) / 100 // Round to 2 decimal places
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        customers: enhancedCustomers,
        pagination: {
          total: totalCustomers,
          page,
          limit,
          totalPages: Math.ceil(totalCustomers / limit),
        },
        stats: formattedStats,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 