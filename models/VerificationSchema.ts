import mongoose from "mongoose";

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


export { VerificationCode };