import { ChatSystem } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Admin } from "@/models/AdminSchema";
import { Customer } from "@/models/CustomerSchema";

export async function GET(
  request: Request,
  context: { params: Promise<{ chatId: string }> }
): Promise<NextResponse> {
  await dbConnect();
  const { chatId } = await context.params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;

  try {
    // Validate chatId format
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json(
        { error: "Invalid chat ID format" },
        { status: 400 }
      );
    }

    const chat = await ChatSystem.findOne({ disputeId: new mongoose.Types.ObjectId(chatId) });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    const totalMessages = chat.messages.length;
    const skip = Math.max(0, totalMessages - (page * limit));
    const actualLimit = Math.min(limit, totalMessages - ((page - 1) * limit));
    
    const populatedChat = await ChatSystem.findOne({ disputeId: chatId })
      .populate([
        {
          path: 'participants',
          select: 'firstName lastName email userName userType',
          populate: {
            path: '_id',
            select: 'firstName lastName email userName userType',
          }
        },
        {
          path: 'disputeId',
          select: 'title status winner resolutionDetails raisedBy raisedTo',
          populate: [
            {
              path: 'raisedBy',
              select: 'firstName lastName email userName userType'
            },
            {
              path: 'raisedTo',
              select: 'firstName lastName email userName userType'
            }
          ]
        },
        {
          path: 'messages',
          select: 'sender content type isRead createdAt files',
          options: { 
            skip: skip,
            limit: actualLimit,
          },
        }
      ]);

    if (!populatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get the participants with correct references
    const participants = await Promise.all(
      populatedChat.participants.map(async (participant: any, index: number) => {
        const Model = populatedChat.participantTypes[index] === 'Admin' ? 
          mongoose.model('Admin') : 
          mongoose.model('Customer');
        
        return Model.findById(participant)
          .select('firstName lastName email userName userType')
          .lean();
      })
    );

    // Populate message senders based on participant type
    const messages = await Promise.all(
      populatedChat.messages.map(async (message: any) => {
        if (!message.sender) return message;

        // Find the participant index to determine the model
        const participantIndex = populatedChat.participants.findIndex(
          (p: any) => p._id.toString() === message.sender.toString()
        );

        if (participantIndex === -1) return message;

        const Model = populatedChat.participantTypes[participantIndex] === 'Admin' ? 
          Admin : Customer;

        const sender = await Model.findById(message.sender)
          .select('firstName lastName email userName userType')
          .lean();

        return {
          ...message.toObject(),
          sender
        };
      })
    );

    // Sort messages in chronological order (oldest to newest)
    const sortedMessages = messages.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json({
      ...populatedChat.toObject(),
      participants,
      messages: sortedMessages,
      hasMore: skip > 0,
      totalMessages,
      currentPage: page,
      status: populatedChat.disputeId.status,
      winner: populatedChat.disputeId.winner,
      resolutionDetails: populatedChat.disputeId.resolutionDetails,
      raisedBy: populatedChat.disputeId.raisedBy,
      raisedTo: populatedChat.disputeId.raisedTo
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}