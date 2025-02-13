import mongoose from "mongoose";

// Schema for Stripe Connect Accounts
const connectAccountSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        stripeAccountId: {
            type: String,
            required: true,
            unique: true,
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "restricted", "closed"],
            default: "pending",
        },
        payoutStatus: {
            type: String,
            enum: ["enabled", "disabled"],
            default: "disabled",
        },
        chargesEnabled: {
            type: Boolean,
            default: false,
        },
        country: {
            type: String,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const ConnectAccount = mongoose.models.ConnectAccount || mongoose.model("ConnectAccount", connectAccountSchema);
export { ConnectAccount };
