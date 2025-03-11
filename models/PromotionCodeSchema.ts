import mongoose from "mongoose";

// Schema for Promotion Codes
const promotionCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 4,
            maxlength: 6,
            uppercase: true,
            validate: {
                validator: function(v: string) {
                    // Allow only alphanumeric characters
                    return /^[A-Z0-9]{4,6}$/.test(v);
                },
                message: "Code must be 4-6 characters long and contain only letters and numbers"
            }
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 1,
            max: 100,
            validate: {
                validator: function(v: number) {
                    return v > 0 && v <= 100;
                },
                message: "Discount percentage must be between 1 and 100"
            }
        },
        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        status: {
            type: String,
            enum: ["active", "inactive", "expired"],
            default: "active"
        },
        validFrom: {
            type: Date,
            required: true,
            default: Date.now
        },
        validUntil: {
            type: Date,
            required: true,
            validate: {
                validator: function(this: any, v: Date) {
                    return v > this.validFrom;
                },
                message: "End date must be after start date"
            }
        },
        usageLimit: {
            type: Number,
            required: true,
            min: 1
        },
        usageCount: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Add index for faster lookups
promotionCodeSchema.index({ code: 1 });
promotionCodeSchema.index({ status: 1 });
promotionCodeSchema.index({ validUntil: 1 });

// Virtual for checking if code is expired
promotionCodeSchema.virtual('isExpired').get(function() {
    return this.validUntil < new Date() || this.usageCount >= this.usageLimit;
});

// Method to validate if code can be used
promotionCodeSchema.methods.canBeUsed = function(): boolean {
    return (
        this.status === 'active' &&
        !this.isExpired &&
        this.usageCount < this.usageLimit &&
        new Date() >= this.validFrom &&
        new Date() <= this.validUntil
    );
};

const PromotionCode = mongoose.models.PromotionCode || mongoose.model("PromotionCode", promotionCodeSchema);

export { PromotionCode }; 