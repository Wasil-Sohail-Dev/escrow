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
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: true,
        },
        milestoneId: {
            type: String,
            required: true,
            get: (v: string) => v,
            set: (v: string) => v,
        },
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        raisedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "process", "resolved", "rejected"],
            default: "pending",
        },
        disputeId: {
            type: String,
            unique: true,
            required: true,
        },
        files: [{
            fileUrl: String,
            fileName: String,
            fileType: String,
        }],
        winner: {
            type: String,
            enum: ["client", "vendor"],
            validate: {
                validator: function(this: any, v: string | undefined) {
                    // Winner is required only when status is "resolved"
                    if (this.status === "resolved") {
                        return v === "client" || v === "vendor";
                    }
                    return true; // Winner is optional for other statuses
                },
                message: "Winner is required when status is resolved"
            }
        },
        resolutionDetails: {
            type: String,
            required: function(this: any) {
                return this.status === "resolved" || this.status === "rejected";
            }
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        resolvedAt: {
            type: Date,
        },
        clientEvidence: evidenceSchema, // Evidence provided by the client
        vendorEvidence: evidenceSchema, // Evidence provided by the vendor
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

// Auto-generate dispute ID
disputeSchema.pre("save", async function (next) {
    if (this.isNew) {
        const count = await mongoose.model("Dispute").countDocuments();
        this.disputeId = `DSP${String(count + 1).padStart(6, "0")}`;
    }
    next();
});

const Dispute = mongoose.models.Dispute || mongoose.model("Dispute", disputeSchema);

export { Dispute };
