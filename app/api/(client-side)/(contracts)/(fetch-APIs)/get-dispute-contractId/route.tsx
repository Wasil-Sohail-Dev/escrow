import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Dispute } from "@/models/DisputeSchema";
import { Customer } from "@/models/CustomerSchema";
import { Contract } from "@/models/ContractSchema";
import { ChatSystem } from "@/models/ChatSystem";

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

interface DisputeDocument {
  _id: string;
  contractId: {
    _id: string;
    title: string;
    contractId: string;
  };
  raisedBy: {
    _id: string;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
  raisedTo: {
    _id: string;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
  title: string;
  reason: string;
  status: string;
  disputeId: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");
    const customerId = searchParams.get("customerId");
    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Contract ID is required." },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    // First, find the contract to get its _id
    const contract = await Contract.findOne({ contractId }).select('_id');
    
    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found." },
        { status: 404 }
      );
    }

    // Find dispute with the contract's _id and ensure the user is involved
    const dispute = (await Dispute.findOne({
      contractId: contract._id,
      $or: [
        { raisedBy: customerId },
        { raisedTo: customerId }
      ]
    })
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
    .lean()) as DisputeDocument | null;

    if (!dispute) {
      return NextResponse.json(
        { success: false, message: "No dispute found for this contract." },
        { status: 404 }
      );
    }

    // Fetch chat data for the dispute
    const chatData = await ChatSystem.findOne({
      disputeId: dispute._id
    })
    .select('disputeId lastMessage lastMessageAt messages')
    .populate({
      path: 'messages',
      match: { isRead: false },
      select: 'sender isRead'
    })
    .lean() as ChatData | null;

    // Prepare chat information
    const chatInfo = chatData ? {
      lastMessage: chatData.lastMessage || null,
      lastMessageAt: chatData.lastMessageAt || null,
      unreadCount: chatData.messages?.filter(
        msg => msg && !msg.isRead && msg.sender?.toString() !== customerId
      ).length || 0
    } : {
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: 0
    };

    // Combine dispute and chat data
    const disputeWithChat = {
      ...dispute,
      chat: chatInfo
    };

    return NextResponse.json(
      {
        success: true,
        data: disputeWithChat
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error fetching dispute by contractId:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
