import mongoose from "mongoose";

// Define the status transitions for KYC
const kycStatusTransitions = {
    pending: ["approved", "rejected"],
    approved: ["revoked"],
    rejected: ["pending"],
    revoked: ["pending"],
};

const isValidKycStatusTransition = (currentStatus: string, newStatus: string): boolean => {
    const validNextStatuses = kycStatusTransitions[currentStatus as keyof typeof kycStatusTransitions];
    return validNextStatuses && validNextStatuses.includes(newStatus);
};

const kycSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        documents: [{
            fileUrl: {
                type: String,
                required: true,
            },
            fileName: {
                type: String,
                required: true,
            },
            fileType: {
                type: String,
                required: true,
            },
            documentType: {
                type: String,
                enum: ["government_id", "passport", "drivers_license", "other"],
                required: true,
                default: "other",
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "revoked"],
            default: "pending",
        },
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        rejectionReason: String,
        remarks: String,
        expiryDate: Date,
    },
    {
        timestamps: true,
    }
);

// Method to update KYC status with flow validation
interface IKYC extends mongoose.Document {
    customerId: mongoose.Types.ObjectId;
    documents: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        documentType: string;
        uploadedAt: Date;
    }>;
    status: "pending" | "approved" | "rejected" | "revoked";
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
    remarks?: string;
    expiryDate?: Date;
    updateStatus(newStatus: string, adminId?: string, reason?: string): Promise<void>;
}

kycSchema.methods.updateStatus = async function(
    this: IKYC,
    newStatus: string,
    adminId?: string,
    reason?: string
): Promise<void> {
    if (!isValidKycStatusTransition(this.status, newStatus)) {
        throw new Error(
            `Invalid status transition from '${this.status}' to '${newStatus}'`
        );
    }

    this.status = newStatus as "pending" | "approved" | "rejected" | "revoked";
    
    if (newStatus === "approved") {
        this.verifiedAt = new Date();
        this.verifiedBy = adminId ? new mongoose.Types.ObjectId(adminId) : undefined;
        this.expiryDate = new Date();
        this.expiryDate.setFullYear(this.expiryDate.getFullYear() + 1); // Set expiry to 1 year from verification
    } else if (newStatus === "rejected") {
        this.rejectionReason = reason;
    }

    await this.save();
};

const KYC = mongoose.models.KYC || mongoose.model<IKYC>("KYC", kycSchema);

export { KYC }; 