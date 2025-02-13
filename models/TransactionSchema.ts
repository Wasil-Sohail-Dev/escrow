import mongoose from "mongoose";

// Schema for Transactions (Tracks every payment movement)
const transactionSchema = new mongoose.Schema(
    {
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: true,
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true, // Links transaction to a specific payment
        },
        milestoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract.milestones",
            required: false,
        },
        payerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true, // Client who funds the escrow
        },
        payeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true, // Vendor receiving the payment
        },
        amount: {
            type: Number,
            required: true, // Amount transferred in this transaction
        },
        stripeTransferId: {
            type: String, // Stripe Transfer ID for tracking individual payments
            required: true,
        },
        type: {
            type: String,
            enum: [
                "fee",
                "funding",
                "release",
                "refund",
                "payout"
            ], // Tracks whether this is escrow funding, vendor payout, or refund
            required: true,
        },
        status: {
            type: String,
            enum: [
                "processing",
                "on_hold",
                "completed",
                "failed",
                "disputed",
                "refunded", "payout_processing"
            ], // Tracks the status of the transaction
            default: "processing",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export { Transaction };
