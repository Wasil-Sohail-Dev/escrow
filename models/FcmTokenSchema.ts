import mongoose from "mongoose";

const FcmTokenSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        fcmToken: { type: String, required: true },
        deviceType: { type: String, enum: ["android", "ios", "web"], required: true },
    },
    { timestamps: true }
);

const FcmToken = mongoose.models.FcmToken || mongoose.model("FcmToken", FcmTokenSchema);

export { FcmToken };
