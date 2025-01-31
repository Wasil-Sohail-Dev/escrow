import mongoose from "mongoose";

// Message schema (Stored separately from ChatSystem)
const messageSchema = new mongoose.Schema(
    {
        chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSystem', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
        content: { type: String, required: true },
        type: { type: String, enum: ['text', 'image', 'document'], default: 'text' },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }], // Track participants who read this message
        isRead: { type: Boolean, default: false }, // Track if the message is read by all participants
    },
    { timestamps: true }
);

// Index for faster queries
messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

// Chat schema (Now references messages instead of embedding them)
const chatSystemSchema = new mongoose.Schema(
    {
        disputeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dispute", // Link the chat to a specific dispute
            required: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Customer", // Array of users participating in the chat
                required: true,
            },
        ],
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // Reference messages instead of embedding
        lastMessage: {
            type: String,
            default: "", // Store the last message for easy display in a list view
        },
        lastMessageAt: {
            type: Date,
            default: Date.now, // Store the timestamp of the last message
        },
    },
    {
        timestamps: true, // Automatically handle `createdAt` and `updatedAt`
    }
);

// Index for dispute ID to improve query speed
chatSystemSchema.index({ disputeId: 1 });

const ChatSystem = mongoose.models.ChatSystem || mongoose.model("ChatSystem", chatSystemSchema);

export { ChatSystem, Message };
