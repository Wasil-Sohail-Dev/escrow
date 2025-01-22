import mongoose from "mongoose";

// File schema to handle uploaded files (images, docs)
const fileSchema = new mongoose.Schema(
    {
        fileUrl: { type: String, required: true }, // URL or path to the file
        fileType: { type: String, required: true }, // E.g., image, document
        fileName: { type: String, required: true }, // Original file name
    },
    { timestamps: true }
);

// Milestone History schema
const milestoneHistorySchema = new mongoose.Schema(
    {
        milestoneId: {
            type: String,
            required: true,
            index: true, // Index for faster queries based on milestone
        },
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: true,
        },
        action: {
            type: String,
            enum: [
                "vendor_submitted", // Vendor submits the milestone
                "client_requested_changes", // Client requests changes
                "client_approved", // Milestone approved
                "payment_released", // payment_release to vendor
                "disputed", // Milestone disputed
            ],
            required: true,
        },
        files: [fileSchema], // Files submitted during this action (e.g., images, docs)
        title: { type: String }, // Title of the action (e.g., milestone title)
        description: { type: String }, // Optional notes or feedback (e.g., client feedback)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer", // Referencing the user who performed the action (client or vendor)
            required: true,
        },
        userRole: {
            type: String,
            enum: ["client", "vendor"],
            required: true,
        },
        timestamp: { type: Date, default: Date.now }, // When the action occurred
    },
    { timestamps: true }
);

// Model for Milestone History
const MilestoneHistory =
    mongoose.models.MilestoneHistory || mongoose.model("MilestoneHistory", milestoneHistorySchema);

export { MilestoneHistory };
