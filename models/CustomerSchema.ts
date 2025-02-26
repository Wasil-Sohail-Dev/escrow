import mongoose from "mongoose";

// Helper function to validate customer status transitions
// Removed duplicate declaration of customerStatusTransitions

// Helper function to check if status transition is valid
interface CustomerStatusTransitions {
  [key: string]: string[];
}

const customerStatusTransitions: CustomerStatusTransitions = {
  pendingVerification: ["verified"],
  verified: ["active", "adminInactive"],
  active: ["adminInactive"],
  adminInactive: ["active", "verified"],
  userInactive: ["active", "adminInactive"],
};

const isValidCustomerStatusTransition = (
  currentStatus: string,
  newStatus: string
): boolean => {
  const validNextStatuses = customerStatusTransitions[currentStatus];
  return validNextStatuses && validNextStatuses.includes(newStatus);
};

// Schema for Customers
const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      unique: true,
      sparse: true, // Allows optional unique field
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows optional unique field
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
      trim: true,
    },
    companyAddress: {
      type: String,
      trim: true,
    },
    userStatus: {
      type: String,
      enum: [
        "pendingVerification",
        "verified",
        "active",
        "adminInactive",
        "userInactive",
      ],
      required: true,
      default: "pendingVerification",
    },
    onboardingToken: {
      type: String,
      default: null,
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to update customer status with flow validation
interface ICustomer extends mongoose.Document {
  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  userType: "client" | "vendor";
  companyName?: string;
  companyAddress?: string;
  userStatus:
    | "pendingVerification"
    | "verified"
    | "active"
    | "adminInactive"
    | "userInactive";
  onboardingToken?: string;
  tokenExpiresAt?: Date;
  updateStatus(newStatus: string): Promise<void>;
}

customerSchema.methods.updateStatus = async function (
  this: ICustomer,
  newStatus: string
): Promise<void> {
  if (!isValidCustomerStatusTransition(this.userStatus, newStatus)) {
    throw new Error(
      `Invalid status transition from '${this.userStatus}' to '${newStatus}'`
    );
  }

  this.userStatus = newStatus as
    | "pendingVerification"
    | "verified"
    | "active"
    | "adminInactive"
    | "userInactive";
  await this.save();
};

// Model for Customer
const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export { Customer };
