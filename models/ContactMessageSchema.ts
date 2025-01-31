import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String, // Optional
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["new", "resolved"],
            default: "new", // To track the status of messages
        },
    },
    {
        timestamps: true, // Automatically creates createdAt and updatedAt
    }
);

const ContactMessage =
    mongoose.models.ContactMessage ||
    mongoose.model("ContactMessage", contactMessageSchema);

export { ContactMessage };
