import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Payment } from "@/models/paymentSchema";

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get URL parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status") || "active";
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Base query
    let query: any = {};

    // Add status filter
    if (status === "active") {
      query.status = { $in: ["active", "in_review", "disputed", "disputed_in_process"] };
    } else if (status === "completed") {
      query.status = { $in: ["completed", "disputed_resolved"] };
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { contractId: { $regex: search, $options: "i" } },
      ];
    }

    // Get projects with pagination and populate related data
    const projects = await Contract.find(query)
      .populate('clientId', 'firstName lastName email createdAt')
      .populate('vendorId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalProjects = await Contract.countDocuments(query);

    // Get project statistics
    const stats = await Contract.aggregate([
      {
        $facet: {
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
          totalValue: [
            {
              $group: {
                _id: null,
                total: { $sum: "$budget" }
              }
            }
          ],
          successRate: [
            {
              $match: {
                status: { $in: ["completed", "disputed_resolved", "active", "in_review"] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                successful: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["completed", "disputed_resolved"]] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Calculate success rate
    const totalProj = stats[0].successRate[0]?.total || 0;
    const successfulProj = stats[0].successRate[0]?.successful || 0;
    const successRate = totalProj > 0 ? (successfulProj / totalProj) * 100 : 0;

    // Format statistics
    const formattedStats = {
      active: stats[0].activeProjects[0]?.count || 0,
      completed: stats[0].completedProjects[0]?.count || 0,
      totalValue: stats[0].totalValue[0]?.total || 0,
      successRate: Math.round(successRate)
    };

    // Get released amounts for each project
    const releasedAmounts = await Payment.aggregate([
      {
        $match: {
          status: "fully_released"
        }
      },
      {
        $group: {
          _id: "$contractId",
          releasedAmount: { $sum: "$releasedAmount" }
        }
      }
    ]);

    // Calculate progress and format projects
    const formattedProjects = projects.map(project => {
      const totalMilestones = project.milestones.length;
      const completedMilestones = project.milestones.filter(
        (m: any) => m.status === "approved" || m.status === "payment_released"
      ).length;
      
      const progress = totalMilestones > 0 
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

      const releasedAmount = releasedAmounts.find(
        ra => ra._id.toString() === project._id.toString()
      )?.releasedAmount || 0;

      const nextMilestone = project.milestones.find(
        (m: any) => m.status !== "approved" && m.status !== "payment_released"
      );

      return {
        _id: project._id,
        contractId: project.contractId,
        title: project.title,
        client: {
          name: `${project.clientId.firstName} ${project.clientId.lastName}`,
          email: project.clientId.email,
          since: project.clientId.createdAt
        },
        budget: project.budget,
        releasedAmount,
        progress,
        nextMilestone: nextMilestone ? {
          title: nextMilestone.title,
          dueDate: nextMilestone.endDate
        } : null,
        status: project.status
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        projects: formattedProjects,
        pagination: {
          total: totalProjects,
          page,
          limit,
          totalPages: Math.ceil(totalProjects / limit),
        },
        stats: formattedStats
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
