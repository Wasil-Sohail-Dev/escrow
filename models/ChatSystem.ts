import mongoose from "mongoose";

// File schema to handle uploaded files (images, documents, etc.)
const fileSchema = new mongoose.Schema(
    {
        fileUrl: { type: String, required: true }, // URL/path to the file
        fileName: { type: String, required: true }, // Original file name
        fileType: { type: String, required: true }, // E.g., image, pdf, zip
    },
    { timestamps: true }
);

// Message schema (Supports text and file messages)
const messageSchema = new mongoose.Schema(
    {
        chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSystem', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
        content: { type: String, default: "", trim: true }, // Text message (optional if sending files)
        type: { type: String, enum: ['text', 'image', 'document', 'file'], default: 'text' }, // Message type
        files: [fileSchema], // Stores multiple uploaded files per message
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }], // Users who read the message
        isRead: { type: Boolean, default: false }, // Tracks if all participants read it
    },
    { timestamps: true }
);

// Index for faster queries
messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

// Chat schema (References messages instead of embedding)
const chatSystemSchema = new mongoose.Schema(
    {
        disputeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dispute", // Links chat to a dispute
            required: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Customer", // Users in the chat
                required: true,
            },
        ],
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // References messages
        lastMessage: {
            type: String,
            default: "", // Stores last text message or file info
        },
        lastMessageAt: {
            type: Date,
            default: Date.now, // Timestamp of last message
        },
    },
    {
        timestamps: true,
    }
);

// Index for dispute ID to improve query speed
chatSystemSchema.index({ disputeId: 1 });

const ChatSystem = mongoose.models.ChatSystem || mongoose.model("ChatSystem", chatSystemSchema);

export { ChatSystem, Message };
