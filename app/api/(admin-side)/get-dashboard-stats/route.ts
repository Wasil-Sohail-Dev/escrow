import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";
import { Dispute } from "@/models/DisputeSchema";
import { KYC } from "@/models/KycSchema";

export async function GET() {
  try {
    await dbConnect();

    // Get revenue statistics
    const revenueStats = await Payment.aggregate([
      {
        $facet: {
          totalRevenue: [
            {
              $match: {
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
                  $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
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
          previousMonthRevenue: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
                  $lte: new Date(new Date().setMonth(new Date().getMonth() - 1))
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

    // Get project statistics
    const projectStats = await Contract.aggregate([
      {
        $facet: {
          totalProjects: [{ $count: "count" }],
          activeProjects: [
            {
              $match: {
                status: { $in: ["active", "in_review", "disputed", "disputed_in_process"] }
              }
            },
            { $count: "count" }
          ],
          completedProjects: [
            {
              $match: {
                status: { $in: ["completed", "disputed_resolved"] }
              }
            },
            { $count: "count" }
          ],
          projectsThisMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(1))
                }
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Get user statistics
    const userStats = await Customer.aggregate([
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          activeUsers: [
            { $match: { userStatus: "active" } },
            { $count: "count" }
          ],
          clientCount: [
            { $match: { userType: "client" } },
            { $count: "count" }
          ],
          vendorCount: [
            { $match: { userType: "vendor" } },
            { $count: "count" }
          ],
          newUsersThisMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(1))
                }
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Get dispute statistics
    const disputeStats = await Dispute.aggregate([
      {
        $facet: {
          activeDisputes: [
            {
              $match: {
                status: { $in: ["pending", "process"] }
              }
            },
            { $count: "count" }
          ],
          resolvedDisputes: [
            {
              $match: {
                status: "resolved",
                resolvedAt: {
                  $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
              }
            },
            { $count: "count" }
          ],
          totalDisputes: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Get KYC statistics
    const kycStats = await KYC.aggregate([
      {
        $facet: {
          pendingVerifications: [
            { $match: { status: "pending" } },
            { $count: "count" }
          ],
          approvedVerifications: [
            { $match: { status: "approved" } },
            { $count: "count" }
          ],
          rejectedVerifications: [
            { $match: { status: "rejected" } },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Calculate growth percentages and other derived stats
    const currentMonthRevenue = revenueStats[0].lastMonthRevenue[0]?.total || 0;
    const previousMonthRevenue = revenueStats[0].previousMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousMonthRevenue === 0 ? 100 :
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

    const totalDisputes = disputeStats[0].totalDisputes[0]?.count || 0;
    const resolvedDisputes = disputeStats[0].resolvedDisputes[0]?.count || 0;
    const disputeResolutionRate = totalDisputes === 0 ? 0 :
      Math.round((resolvedDisputes / totalDisputes) * 100);

    // Format the response
    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          total: revenueStats[0].totalRevenue[0]?.total || 0,
          currentMonth: currentMonthRevenue,
          growth: Math.round(revenueGrowth * 100) / 100
        },
        projects: {
          total: projectStats[0].totalProjects[0]?.count || 0,
          active: projectStats[0].activeProjects[0]?.count || 0,
          completed: projectStats[0].completedProjects[0]?.count || 0,
          newThisMonth: projectStats[0].projectsThisMonth[0]?.count || 0
        },
        users: {
          total: userStats[0].totalUsers[0]?.count || 0,
          active: userStats[0].activeUsers[0]?.count || 0,
          clients: userStats[0].clientCount[0]?.count || 0,
          vendors: userStats[0].vendorCount[0]?.count || 0,
          newThisMonth: userStats[0].newUsersThisMonth[0]?.count || 0
        },
        disputes: {
          active: disputeStats[0].activeDisputes[0]?.count || 0,
          resolved: disputeStats[0].resolvedDisputes[0]?.count || 0,
          resolutionRate: disputeResolutionRate
        },
        kyc: {
          pending: kycStats[0].pendingVerifications[0]?.count || 0,
          approved: kycStats[0].approvedVerifications[0]?.count || 0,
          rejected: kycStats[0].rejectedVerifications[0]?.count || 0
        },
        systemHealth: {
          status: "operational",
          uptime: 99.9,
          services: {
            payments: "operational",
            escrow: "operational",
            authentication: "operational"
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 