import mongoose from "mongoose";

// Schema for Customers
const customerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: false,
            trim: true,
        },
        lastName: {
            type: String,
            required: false,
            trim: true,
        },
        userName: {
            type: String,
            required: false,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: false,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String,
            default: null,
        },
        userType: {
            type: String,
            enum: ["client", "vendor"],
            required: true,
            default: "client",
        },
        companyName: {
            type: String,
            default: null,
            trim: true,
        },
        companyAddress: {
            type: String,
            default: null,
            trim: true,
        },
        userStatus: {
            type: String,
            enum: ["pendingVerification", "verified", "active", "adminInactive", "userInactive"],
            required: true,
            default: "pendingVerification",
        },
        onboardingToken: { type: String, default: null },  // Store token here
        tokenExpiresAt: { type: Date, default: null },      // Store token expiration time
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

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);


// Schema for Contracts
const contractSchema = new mongoose.Schema(
    {
        contractId: {
            type: String,
            required: true,
            unique: true,
            default: function () {
                const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
                const numbers = Math.floor(1000 + Math.random() * 9000).toString();
                return `${letters}-${numbers}`;
            },
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        vendorEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        contractTemplate: {
            type: String, // URL or path to the contract template file (doc/image)
            required: false,
        },
        budget: {
            type: Number,
            required: true,
        },
        paymentType: {
            type: String,
            enum: ["milestone", "hourly", "fixed"],
            required: true,
        },
        milestones: [
            {
                title: { type: String, required: true },
                amount: { type: Number, required: true },
                description: { type: String, required: true },
                status: {
                    type: String,
                    enum: ["pending", "working", "completed", "disputed"],
                    default: "pending",
                },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],
        status: {
            type: String,
            enum: ["draft", "active", "completed", "cancelled", "disputed"],
            default: "draft",
        },
        startDate: { type: Date },
        endDate: { type: Date },
        contractFile: {
            type: String, // Path or URL to the uploaded contract file (doc/image)
            required: false,
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
        timestamps: true,
    }
);


const Contract = mongoose.models.Contract || mongoose.model("Contract", contractSchema);


// schema for verification code
const verificationCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    expires: { type: Date, required: true },
},
    {
        timestamps: true,
    }
);

const VerificationCode = mongoose.models.VerificationCode || mongoose.model('VerificationCode', verificationCodeSchema);


// Schema for Payments
const paymentSchema = new mongoose.Schema(
    {
        projectId: {
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
            required: true,
        },
        payeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },
        transactionId: {
            type: String,
            unique: true,
        },
        paymentMethod: {
            type: String,
            enum: ["creditCard", "bankTransfer", "paypal", "crypto"],
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
        timestamps: true,
    }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);


// Schema for Disputes
const disputeSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contract",
            required: true,
        },
        milestoneId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "resolved", "rejected"],
            default: "open",
        },
        resolutionDetails: {
            type: String,
            trim: true,
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
        timestamps: true,
    }
);

const Dispute = mongoose.models.Dispute || mongoose.model("Dispute", disputeSchema);


// Schema for Notifications
const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["info", "warning", "success", "error"],
            default: "info",
        },
        read: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export { Customer, VerificationCode, Contract, Payment, Dispute, Notification };
