import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true, // Index for faster lookups by email
    },
    token: {
        type: String,
        required: true,
        unique: true, // Ensure token uniqueness
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

// Optional: Create a TTL index for automatic deletion of expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);

export default PasswordReset;
