import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { ChatSystem } from "@/models/ChatSystem";

// First, let's add proper interfaces
interface ChatMessage {
  _id: string;
  sender: string;
  isRead: boolean;
}

interface ChatData {
  _id: string;
  disputeId: string;
  lastMessage: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  __v?: number;
}

interface ChatMapType {
  [key: string]: {
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
  };
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const userType = searchParams.get("userType"); // "client" or "vendor"

    // Validate query parameters
    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    if (!userType || (userType !== "client" && userType !== "vendor")) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid userType is required ('client' or 'vendor').",
        },
        { status: 400 }
      );
    }

    // Validate that the customer exists and matches the given userType
    const customer = await Customer.findOne({ _id: customerId, userType });
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "No customer found with the provided ID and userType.",
        },
        { status: 404 }
      );
    }

    // Instead of using userType to determine the field, use $or to match either field
    let query: any = {
      $or: [
        { raisedBy: customerId },
        { raisedTo: customerId }
      ]
    };

    // Add status to query if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate({
        path: "raisedBy",
        select: "email userName firstName lastName userType",
        model: Customer,
      })
      .populate({
        path: "raisedTo",
        select: "email userName firstName lastName userType",
        model: Customer,
      })
      .populate({
        path: "contractId",
        select: "title contractId",
        model: Contract,
      })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch chat data for all disputes in a single query
    const chatData = await ChatSystem.find({
      disputeId: { $in: disputes.map(d => d._id) }
    })
    .select('disputeId lastMessage lastMessageAt messages')
    .populate({
      path: 'messages',
      match: { isRead: false },
      select: 'sender isRead'
    })
    .lean()
    .then(docs => docs as unknown as ChatData[]); // Safe type casting

    // Create a map for quick lookup with proper typing
    const chatMap: ChatMapType = chatData.reduce((acc: ChatMapType, chat) => {
      if (!chat || !chat.messages) return acc;

      const unreadCount = chat.messages.filter(
        msg => msg && !msg.isRead && msg.sender?.toString() !== customerId
      ).length;

      if (chat.disputeId) {
        acc[chat.disputeId.toString()] = {
          lastMessage: chat.lastMessage || null,
          lastMessageAt: chat.lastMessageAt || null,
          unreadCount: unreadCount || 0
        };
      }
      return acc;
    }, {});

    // Combine dispute and chat data with proper type checking
    const disputesWithChat = disputes.map(dispute => ({
      ...dispute,
      chat: chatMap[(dispute._id as string).toString()] || {
        lastMessage: null,
        lastMessageAt: null,
        unreadCount: 0
      }
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          totalDisputes: disputes.length,
          disputes: disputesWithChat,
          latestDispute: disputesWithChat[0],
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
