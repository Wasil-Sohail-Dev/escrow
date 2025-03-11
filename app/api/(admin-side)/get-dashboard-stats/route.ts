import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";
import { Dispute } from "@/models/DisputeSchema";
import { KYC } from "@/models/KycSchema";
import { Admin } from "@/models/AdminSchema";

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
          projectsByStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
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

    // Process project statistics
    const statusColors = {
      draft: '#6B7280',
      onboarding: '#0EA5E9',
      funding_pending: '#F59E0B',
      funding_processing: '#F59E0B',
      funding_onhold: '#EF4444',
      active: '#22C55E',
      in_review: '#0EA5E9',
      completed: '#22C55E',
      cancelled: '#EF4444',
      disputed: '#EF4444',
      disputed_in_process: '#F59E0B',
      disputed_resolved: '#22C55E'
    };

    const statusLabels = {
      draft: 'Draft',
      onboarding: 'Onboarding',
      funding_pending: 'Funding Pending',
      funding_processing: 'Processing',
      funding_onhold: 'On Hold',
      active: 'Active',
      in_review: 'In Review',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
      disputed_in_process: 'Dispute Processing',
      disputed_resolved: 'Resolved'
    };

    const projectDistribution = projectStats[0].projectsByStatus.map((status: any) => ({
      name: statusLabels[status._id as keyof typeof statusLabels] || status._id,
      value: status.count,
      color: statusColors[status._id as keyof typeof statusColors] || '#6B7280'
    }));

    // Get user statistics with monthly trend data
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
          ],
          monthlyTrends: [
            {
              $project: {
                yearMonth: {
                  $dateToString: { format: "%Y-%m", date: "$createdAt" }
                },
                userType: 1
              }
            },
            {
              $group: {
                _id: {
                  yearMonth: "$yearMonth",
                  userType: "$userType"
                },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { "_id.yearMonth": 1 }
            }
          ]
        }
      }
    ]);

    // Process monthly trends data
    const monthlyTrends = userStats[0].monthlyTrends;
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // Format: YYYY-MM
    }).reverse();

    const userTrendData = last6Months.map((yearMonth: string) => {
      const clientData = monthlyTrends.find(
        (trend: any) => trend._id.yearMonth === yearMonth && trend._id.userType === "client"
      );
      const vendorData = monthlyTrends.find(
        (trend: any) => trend._id.yearMonth === yearMonth && trend._id.userType === "vendor"
      );

      return {
        name: new Date(yearMonth).toLocaleString('default', { month: 'short' }),
        clients: clientData?.count || 0,
        vendors: vendorData?.count || 0
      };
    });

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
          ],
          monthlyVerifications: [
            {
              $group: {
                _id: {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ]
        }
      }
    ]);

    // Get admin statistics
    const adminStats = await Admin.aggregate([
      {
        $facet: {
          totalAdmins: [
            { $match: { userType: { $ne: "super_admin" } } },
            { $count: "count" }
          ],
          activeAdmins: [
            { 
              $match: { 
                userType: { $ne: "super_admin" },
                userStatus: "active"
              }
            },
            { $count: "count" }
          ],
          inactiveAdmins: [
            {
              $match: {
                userType: { $ne: "super_admin" },
                userStatus: "inactive"
              }
            },
            { $count: "count" }
          ],
          byRole: [
            {
              $match: { userType: { $ne: "super_admin" } }
            },
            {
              $group: {
                _id: "$userType",
                count: { $sum: 1 }
              }
            }
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
          distribution: projectDistribution,
          newThisMonth: projectStats[0].projectsThisMonth[0]?.count || 0
        },
        users: {
          total: userStats[0].totalUsers[0]?.count || 0,
          active: userStats[0].activeUsers[0]?.count || 0,
          clients: userStats[0].clientCount[0]?.count || 0,
          vendors: userStats[0].vendorCount[0]?.count || 0,
          newThisMonth: userStats[0].newUsersThisMonth[0]?.count || 0,
          trends: userTrendData
        },
        disputes: {
          active: disputeStats[0].activeDisputes[0]?.count || 0,
          resolved: disputeStats[0].resolvedDisputes[0]?.count || 0,
          resolutionRate: disputeResolutionRate
        },
        kyc: {
          pending: kycStats[0].pendingVerifications[0]?.count || 0,
          approved: kycStats[0].approvedVerifications[0]?.count || 0,
          rejected: kycStats[0].rejectedVerifications[0]?.count || 0,
          monthlyTrend: kycStats[0].monthlyVerifications
        },
        admins: {
          total: adminStats[0].totalAdmins[0]?.count || 0,
          active: adminStats[0].activeAdmins[0]?.count || 0,
          inactive: adminStats[0].inactiveAdmins[0]?.count || 0,
          byRole: adminStats[0].byRole || []
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