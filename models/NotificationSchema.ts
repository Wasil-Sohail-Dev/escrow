import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: false
        }, // Optional if system-generated

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        }, // Who receives the notification

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["system", "user", "payment", "alert"],
            required: true
        }, // Define notification types

        severity: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info"
        }, // Notification importance

        link: {
            type: String,
            default: null
        }, // If clicking leads to a page

        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }, // Store extra data as needed

        isRead: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["unread", "read", "dismissed"],
            default: "unread"
        }, // More control over actions

        category: {
            type: String,
            default: "general"
        }, // Can be used to filter notifications

        expiresAt: {
            type: Date,
            default: null
        }, // If notifications should auto-expire
    },
    { timestamps: true }
);

const Notification =
    mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export { Notification };
