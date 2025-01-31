import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ChatSystem, Message } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> } // Match Next.js's expected type
) {
  const { chatId } = await context.params; // Resolve the Promise
  const { sender, content, type } = await request.json();

  await dbConnect();
  const session: mongoose.ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const newMessage = await Message.create(
      [{ chatId, sender, content, type }],
      { session }
    );

    if (!newMessage || newMessage.length === 0) {
      throw new Error("Failed to create message");
    }

    const chat = await ChatSystem.findOneAndUpdate(
      { disputeId: chatId },
      {
        $push: { messages: newMessage[0]._id },
        $set: { lastMessage: content, lastMessageAt: new Date() },
      },
      { new: true, session }
    );

    if (!chat) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}