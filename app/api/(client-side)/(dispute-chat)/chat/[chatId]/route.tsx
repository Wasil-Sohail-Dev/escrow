import { ChatSystem } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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
      .populate("participants", "name email")
      .populate({
        path: "messages",
        select: "sender content type isRead createdAt files",
        populate: {
          path: "sender",
          select: "userName email"
        },
        options: { 
          skip: skip,
          limit: actualLimit,
        },
      });

    if (!populatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Sort messages in chronological order (oldest to newest)
    const messages = [...populatedChat.messages];

    return NextResponse.json({
      ...populatedChat.toObject(),
      messages,
      hasMore: skip > 0,
      totalMessages,
      currentPage: page
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}