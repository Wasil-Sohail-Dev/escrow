import mongoose from "mongoose";

// Helper function to validate contract status transitions
interface ContractStatusTransitions {
  [key: string]: string[];
}

const contractStatusTransitions: ContractStatusTransitions = {
  draft: ["onboarding"], // Initial state, only transitions to onboarding
  onboarding: ["funding_pending", "cancelled"], // After onboarding, can go to funding_pending or be cancelled
  funding_pending: ["funding_processing", "cancelled"], // After funding_pending, it can go to processing or cancelled
  funding_processing: ["funding_onhold", "active"], // During processing, can either go on hold or be activated
  funding_onhold: ["funding_processing", "active"], // Can go back to processing or move to active after being on hold
  active: ["in_review"], // Active contracts can move to in_review
  in_review: ["completed", "cancelled", "disputed"], // Contracts in review can move to completed, cancelled, or disputed
  completed: [], // Completed contracts cannot transition anywhere further
  cancelled: [], // Cancelled contracts cannot transition anywhere further
  disputed: ["disputed_in_process", "disputed_resolved"], // Disputed contracts can move to disputed_in_process or be resolved
  disputed_in_process: ["disputed_resolved"], // Disputed_in_process can only go to disputed_resolved
  disputed_resolved: ["active"], // Resolved disputes go active
};

const isValidContractStatusTransition = (
  currentStatus: keyof typeof contractStatusTransitions,
  newStatus: string
): boolean => {
  const validNextStatuses: string[] = contractStatusTransitions[currentStatus];
  return validNextStatuses && validNextStatuses.includes(newStatus);
};

// Schema for Contract
const contractSchema = new mongoose.Schema(
  {
    contractId: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        const letters = Math.random()
          .toString(36)
          .substring(2, 4)
          .toUpperCase();
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
    budget: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["hourly", "fixed"],
      required: true,
    },
    milestones: [
      {
        milestoneId: {
          type: String,
          required: true,
          unique: true,
          default: function () {
            const letters = Math.random()
              .toString(36)
              .substring(2, 4)
              .toUpperCase();
            const numbers = Math.floor(1000 + Math.random() * 9000).toString();
            return `MS-${letters}-${numbers}`;
          },
        },
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        status: {
          type: String,
          enum: [
            "pending",
            "working",
            "ready_for_review",
            "change_requested",
            "approved",
            "payment_released",
            "disputed",
            "disputed_in_process",
            "disputed_resolved",
          ],
          default: "pending",
        },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    status: {
      type: String,
      enum: [
        "draft",
        "onboarding",
        "funding_pending",
        "funding_processing",
        "funding_onhold",
        "active",
        "in_review",
        "completed",
        "cancelled",
        "disputed",
        "disputed_in_process",
        "disputed_resolved",
      ],
      default: "draft",
    },
    substatus: {
      type: String,
      enum: [
        null,
        "payment_pending",
        "payment_processing",
        "payment_complete",
        "paused",
        "amendment_pending",
        "dispute_in_process",
        "resolved",
      ],
      default: null,
    },
    contractTemplate: {
      type: String,
      required: false,
    },
    contractFile: [
      {
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
          required: false,
        },
      },
    ],
    contractType: {
      type: String,
      required: true,
      enum: ["services", "products"],
      default: "services",
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Method to update the contract status with flow validation
contractSchema.methods.updateStatus = async function (
  newStatus: string,
  subStatus = null
) {
  if (!isValidContractStatusTransition(this.status, newStatus)) {
    throw new Error(
      `Invalid status transition from '${this.status}' to '${newStatus}'`
    );
  }
  this.status = newStatus;
  if (subStatus) {
    this.substatus = subStatus;
  }
  await this.save();
};

// Model for Contract
const Contract =
  mongoose.models.Contract || mongoose.model("Contract", contractSchema);

export { Contract };
