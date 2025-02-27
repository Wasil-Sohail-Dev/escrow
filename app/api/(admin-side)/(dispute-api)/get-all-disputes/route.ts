import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";
import { Contract } from "@/models/ContractSchema";
import { Customer } from "@/models/CustomerSchema";
import { ChatSystem } from "@/models/ChatSystem";

interface Message {
  isRead: boolean;
}

interface ChatDocument {
  lastMessage?: any;
  lastMessageAt?: Date;
  messages?: Array<{ isRead: boolean }>;
}

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

    // Add status filter
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
        { disputeId: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } }
      ];
    }

    // Get disputes with pagination and populate related data
    const disputes = await Dispute.find(query)
      .populate({
        path: 'contractId',
        select: 'title contractId milestones',
        model: Contract
      })
      .populate({
        path: 'raisedBy',
        select: 'firstName lastName email userName userType',
        model: Customer
      })
      .populate({
        path: 'raisedTo',
        select: 'firstName lastName email userName userType',
        model: Customer
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalDisputes = await Dispute.countDocuments(query);

    // Get dispute statistics
    const stats = await Dispute.aggregate([
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
                status: "resolved"
              }
            },
            { $count: "count" }
          ],
          amountInDispute: [
            {
              $lookup: {
                from: "contracts",
                localField: "contractId",
                foreignField: "_id",
                as: "contract"
              }
            },
            {
              $unwind: "$contract"
            },
            {
              $match: {
                status: { $in: ["pending", "process"] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$contract.budget" }
              }
            }
          ],
          resolutionRate: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                resolved: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "resolved"] }, 1, 0]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Get chat data for each dispute
    const chatData = await Promise.all(
      disputes.map(async (dispute) => {
        const chat = await ChatSystem.findOne({ disputeId: dispute._id })
          .select('lastMessage lastMessageAt messages')
          .lean() as ChatDocument;

        const chatData = {
          lastMessage: chat?.lastMessage ?? null,
          lastMessageAt: chat?.lastMessageAt ?? null,
          messages: chat?.messages ?? [],
        };

        return {
          disputeId: dispute._id,
          chat: {
            lastMessage: chatData.lastMessage,
            lastMessageAt: chatData.lastMessageAt,
            unreadCount: chatData.messages.filter(msg => !msg.isRead).length
          }
        };
      })
    );

    // Format disputes with chat data
    const formattedDisputes = disputes.map(dispute => {
      const disputeObj = dispute.toObject();
      const disputeChat = chatData.find(c => c.disputeId.toString() === dispute._id.toString());
      return {
        ...disputeObj,
        chat: disputeChat?.chat || {
          lastMessage: null,
          lastMessageAt: null,
          unreadCount: 0
        }
      };
    });

    // Calculate resolution rate
    const resolutionStats = stats[0].resolutionRate[0] || { total: 0, resolved: 0 };
    const resolutionRate = resolutionStats.total > 0
      ? Math.round((resolutionStats.resolved / resolutionStats.total) * 100)
      : 0;

    // Format statistics
    const formattedStats = {
      active: stats[0].activeDisputes[0]?.count || 0,
      resolved: stats[0].resolvedDisputes[0]?.count || 0,
      amountInDispute: stats[0].amountInDispute[0]?.total || 0,
      resolutionRate
    };

    return NextResponse.json({
      success: true,
      data: {
        disputes: formattedDisputes,
        pagination: {
          total: totalDisputes,
          page,
          limit,
          totalPages: Math.ceil(totalDisputes / limit),
        },
        stats: formattedStats
      },
    });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 