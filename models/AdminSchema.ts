import mongoose from "mongoose";
import argon2 from "argon2";

// Helper function to check if status transition is valid
interface AdminStatusTransitions {
    [key: string]: string[];
}

const adminStatusTransitions: AdminStatusTransitions = {
    pendingVerification: ["verified"],
    verified: ["active", "inactive"],
    active: ["inactive"],
    inactive: ["active"],
};

const isValidAdminStatusTransition = (currentStatus: string, newStatus: string): boolean => {
    const validNextStatuses = adminStatusTransitions[currentStatus];
    return validNextStatuses && validNextStatuses.includes(newStatus);
};

// Schema for Admins
const adminSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        userName: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
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
            enum: ["super_admin", "admin", "moderator"],
            required: true,
            default: "admin",
        },
        userStatus: {
            type: String,
            enum: ["active", "inactive"],
            required: true,
            default: "active",
        },
        permissions: [{
            type: String,
            enum: [
                "manage_users",
                "manage_payments",
                "manage_disputes",
                "manage_contracts",
                "manage_admins",
                "view_analytics",
                "all"
            ]
        }],
        lastLogin: {
            type: Date,
            default: null,
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await argon2.hash(this.password);
    }
    next();
});

// Method to update admin status with flow validation
interface IAdmin extends mongoose.Document {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    profileImage?: string;
    userType: "super_admin" | "admin" | "moderator";
    userStatus: "active" | "inactive";
    permissions: string[];
    lastLogin?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    updateStatus(newStatus: string): Promise<void>;
}

adminSchema.methods.updateStatus = async function (this: IAdmin, newStatus: string): Promise<void> {
    if (!isValidAdminStatusTransition(this.userStatus, newStatus)) {
        throw new Error(
            `Invalid status transition from '${this.userStatus}' to '${newStatus}'`
        );
    }

    this.userStatus = newStatus as "active" | "inactive";
    await this.save();
};

// Model for Admin
const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", adminSchema);

export { Admin }; 