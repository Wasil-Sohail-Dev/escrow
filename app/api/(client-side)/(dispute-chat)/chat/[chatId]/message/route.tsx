import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ChatSystem, Message } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";
import { uploadFileToS3 } from "@/lib/s3"; // Import S3 upload function

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await context.params; // Resolve Promise
  const formData = await request.formData(); // Extract FormData for text & file
  const sender = formData.get("sender") as string;
  const content = formData.get("content") as string;
  const type = (formData.get("type") as string) || "text";
  const files = formData.getAll("files") as File[];

  await dbConnect();
  const session: mongoose.ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    let uploadedFiles: {
      fileUrl: string;
      fileName: string;
      fileType: string;
    }[] = [];

    // Handle file uploads if files are present
    if (files.length > 0) {
      try {
        const uploadPromises = files.map((file) =>
          uploadFileToS3(file, "chat-uploads")
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedFiles = uploadResults.map(({ fileUrl, fileName }) => ({
          fileUrl,
          fileName,
          fileType: fileName.split(".").pop() || "unknown",
        }));
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload chat files." },
          { status: 500 }
        );
      }
    }

    // Ensure at least text or file is provided
    if (!content && uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "Either text content or files must be provided." },
        { status: 400 }
      );
    }

    // Create message entry
    const newMessage = await Message.create(
      [
        {
          chatId,
          sender,
          content: content || "", // Store empty string if no text is provided
          type: uploadedFiles.length > 0 ? "file" : "text",
          files: uploadedFiles, // Store uploaded file data
        },
      ],
      { session }
    );

    if (!newMessage || newMessage.length === 0) {
      throw new Error("Failed to create message");
    }

    // Update chat system with new message
    const chat = await ChatSystem.findOneAndUpdate(
      { disputeId: chatId },
      {
        $push: { messages: newMessage[0]._id },
        $set: {
          lastMessage: content || (uploadedFiles.length > 0 ? "File sent" : ""),
          lastMessageAt: new Date(),
        },
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
