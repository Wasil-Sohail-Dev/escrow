import mongoose from "mongoose";

// Schema for Payments
const paymentSchema = new mongoose.Schema(
    {
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: true,
        },
        milestoneId: {
            type: mongoose.Schema.Types.ObjectId,
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
            required: true, // Total amount including platform fees
        },
        platformFee: {
            type: Number,
            required: true, // The fee charged by your app
        },
        escrowAmount: {
            type: Number,
            required: true, // Amount held in escrow (amount - platformFee)
        },
        stripePaymentIntentId: {
            type: String,
            required: true, // Stripe Payment Intent ID for tracking
        },
        stripeTransferId: {
            type: String, // Stripe Transfer ID when funds are released to the vendor
        },
        status: {
            type: String,
            enum: ["pending", "process", "on_hold", "funded", "released", "failed", "refunded", "disputed"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["stripe"],
            default: "stripe",
        },
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
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export { Payment };
