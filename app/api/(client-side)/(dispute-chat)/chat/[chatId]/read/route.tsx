import { NextResponse } from "next/server";
import { Message } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";

interface PostRequestBody {
  participantId: string;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ chatId: string }> } // Match Next.js's expected type
): Promise<NextResponse> {
  const { chatId } = await context.params; // Resolve the Promise
  const { participantId }: PostRequestBody = await request.json();

  await dbConnect();

  try {
    const result = await Message.updateMany(
      { chatId, readBy: { $ne: participantId } },
      {
        $addToSet: { readBy: participantId },
        $set: { isRead: true },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No new messages to mark as read" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, updatedMessages: result.modifiedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}