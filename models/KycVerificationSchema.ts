import mongoose from "mongoose";

const kycVerificationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    kycId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KYC",
    //   required: true,
    },
    isKycApproved: {
      type: Boolean,
      required: true,
      default: false,
    },
    kycDescription: {
      type: String,
      required: function(this: { isKycApproved: boolean }) {
        return !this.isKycApproved
      },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      required: function(this: { isBlocked: boolean }) {
        return this.isBlocked;
      },
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const KycVerification = mongoose.models.KycVerification || mongoose.model("KycVerification", kycVerificationSchema);

export { KycVerification }; 