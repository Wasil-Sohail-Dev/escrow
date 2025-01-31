import { ChatSystem } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

interface ChatMessage {
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  type: string;
  createdAt: Date;
}

interface ChatParticipant {
  name: string;
  email: string;
}

interface Chat {
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

export async function GET(
  request: Request,
  context: { params: Promise<{ chatId: string }> } // Updated type definition
): Promise<NextResponse> {
  await dbConnect();
  const { chatId } = await context.params; // Resolve the Promise

  try {
    const chat: Chat | null = await ChatSystem.findOne({ disputeId: chatId })
      .populate("participants", "name email")
      .populate({
        path: "messages",
        select: "sender content type isRead createdAt",
        populate: {
          path: "sender",
          select: "userName email",
        },
        options: { sort: { createdAt: -1 }, limit: 50 },
      });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}