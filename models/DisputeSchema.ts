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

// Evidence schema to handle description and files for both vendor and client
const evidenceSchema = new mongoose.Schema(
    {
        description: { type: String, required: true }, // Description of the evidence
        files: [fileSchema], // Files submitted as evidence (images, docs)
    },
    { timestamps: true }
);

// Schema for Disputes
const disputeSchema = new mongoose.Schema(
    {
        disputeId: {
            type: String,
            required: true,
            unique: true,
            default: function () {
                const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
                const numbers = Math.floor(1000 + Math.random() * 9000).toString();
                return `DI-${letters}-${numbers}`;
            },
        },
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: true,
        },
        milestoneId: {
            type: String,
            required: false,
        },
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        raisedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer", // Assuming raisedTo is a customer (either client or vendor)
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "process", "resolved", "rejected"],
            default: "pending",
        },
        resolutionDetails: {
            type: String,
            trim: true,
        },
        clientEvidence: evidenceSchema, // Evidence provided by the client
        vendorEvidence: evidenceSchema, // Evidence provided by the vendor
        files: [fileSchema], // New field to store dispute-related files
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Dispute = mongoose.models.Dispute || mongoose.model("Dispute", disputeSchema);

export { Dispute };
