import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/paymentSchema";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get URL parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Base query
    let query: any = {};

    // Add status filter if specified
    if (status !== "all") {
      query.status = status;
    }

    // Add search filter if specified
    if (search) {
      const contracts = await Contract.find({
        title: { $regex: search, $options: "i" }
      }).select('_id');
      const contractIds = contracts.map(contract => contract._id);
      
      query.$or = [
        { contractId: { $in: contractIds } },
        { stripePaymentIntentId: { $regex: search, $options: "i" } }
      ];
    }

    // Get payments with pagination and populate related data
    const payments = await Payment.find(query)
      .populate({
        path: 'contractId',
        select: 'title milestones currentMilestone',
        populate: {
          path: 'milestones',
          select: 'title amount startDate endDate'
        }
      })
      .populate('payerId', 'firstName lastName email')
      .populate('payeeId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalPayments = await Payment.countDocuments(query);

    // Get payment statistics
    const stats = await Payment.aggregate([
      {
        $facet: {
          totalEarnings: [
            {
              $match: {
                status: { $in: ["funded", "partially_released", "fully_released"] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
                lastMonth: {
                  $sum: {
                    $cond: [
                      {
                        $gte: ["$createdAt", new Date(new Date().setMonth(new Date().getMonth() - 1))]
                      },
                      "$totalAmount",
                      0
                    ]
                  }
                }
              }
            }
          ],
          pendingPayments: [
            { $match: { status: "processing" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                amount: { $sum: "$totalAmount" }
              }
            }
          ],
          inEscrow: [
            { $match: { status: { $in: ["funded", "partially_released"] } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                amount: { $sum: "$onHoldAmount" }
              }
            }
          ],
          released: [
            {
              $match: {
                status: "fully_released",
                createdAt: {
                  $gte: new Date(new Date().setDate(1)) // First day of current month
                }
              }
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$releasedAmount" }
              }
            }
          ]
        }
      }
    ]);

    // Calculate growth percentage
    const currentMonthEarnings = stats[0].totalEarnings[0]?.total || 0;
    const lastMonthEarnings = stats[0].totalEarnings[0]?.lastMonth || 0;
    const growthPercentage = lastMonthEarnings === 0 ? 0 :
      ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;

    // Format response
    const formattedStats = {
      totalEarnings: {
        amount: stats[0].totalEarnings[0]?.total || 0,
        growth: Math.round(growthPercentage * 100) / 100
      },
      pending: {
        amount: stats[0].pendingPayments[0]?.amount || 0,
        count: stats[0].pendingPayments[0]?.count || 0
      },
      inEscrow: {
        amount: stats[0].inEscrow[0]?.amount || 0,
        count: stats[0].inEscrow[0]?.count || 0
      },
      released: {
        amount: stats[0].released[0]?.amount || 0
      }
    };

    // Get upcoming payments (milestones due in next 30 days)
    const upcomingPayments = await Contract.aggregate([
      {
        $unwind: "$milestones"
      },
      {
        $match: {
          "milestones.endDate": {
            $gte: new Date(),
            $lte: new Date(new Date().setDate(new Date().getDate() + 30))
          },
          "milestones.status": { $ne: "completed" }
        }
      },
      {
        $limit: 5
      },
      {
        $project: {
          title: 1,
          milestone: "$milestones",
          daysUntilDue: {
            $ceil: {
              $divide: [
                { $subtract: ["$milestones.endDate", new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments: payments,
        pagination: {
          total: totalPayments,
          page,
          limit,
          totalPages: Math.ceil(totalPayments / limit),
        },
        stats: formattedStats,
        upcomingPayments
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
