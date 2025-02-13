import mongoose from "mongoose";

// Schema for Payments (Tracks overall escrow deposit for a contract)
const paymentSchema = new mongoose.Schema(
    {
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: true,
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
        totalAmount: {
            type: Number,
            required: true, // Total amount including platform fees
        },
        platformFee: {
            type: Number,
            required: true, // The fee charged by your app
        },
        escrowAmount: {
            type: Number,
            required: true, // Amount held in escrow (totalAmount - platformFee)
        },
        stripePaymentIntentId: {
            type: String,
            required: true, // Stripe Payment Intent ID for tracking
        },
        onHoldAmount: {
            type: Number,
            required: true, // Amount still in escrow
            default: 0,
        },
        releasedAmount: {
            type: Number,
            required: true, // Amount already transferred to vendor
            default: 0,
        },
        status: {
            type: String,
            enum: [
                "processing",
                "funded",
                "on_hold",
                "partially_released",
                "fully_released",
                "failed",
                "refunded",
                "disputed"
            ], // Tracks the status of the payment
            default: "processing",
        },
        paymentMethod: {
            type: String,
            enum: ["stripe"],
            default: "stripe",
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export { Payment };
