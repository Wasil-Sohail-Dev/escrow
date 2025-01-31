import { NextResponse } from "next/server";
import { ChatSystem } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";

// Create a new chat session
export async function POST(request: Request) {
  await dbConnect();
  const { disputeId, participants } = await request.json();

  try {
    const newChat = await ChatSystem.create({
      disputeId,
      participants,
      messages: [],
    });

    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
