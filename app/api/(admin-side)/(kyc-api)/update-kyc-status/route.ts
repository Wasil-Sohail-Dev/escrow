import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { KYC } from "@/models/KycSchema";
import { Customer } from "@/models/CustomerSchema";
import { KycVerification } from "@/models/KycVerificationSchema";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { kycId, status, adminId, reason } = await req.json();

    if (!kycId || !status || !adminId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find KYC record
    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return NextResponse.json(
        { success: false, error: "KYC record not found" },
        { status: 404 }
      );
    }

    // Validate rejection reason
    if (status === "rejected" && !reason?.trim()) {
      return NextResponse.json(
        { success: false, error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Create KYC verification record
    await KycVerification.create({
      customerId: kyc.customerId,
      kycId: kyc._id,
      isKycApproved: status === "approved",
      kycDescription: reason,
      verifiedBy: adminId
    });

    // Update KYC status
    await kyc.updateStatus(status, adminId, reason);

    // If approved, update customer status to verified
    if (status === "approved") {
      const customer = await Customer.findById(kyc.customerId);
      if (customer && customer.userStatus === "pendingVerification") {
        await customer.updateStatus("verified");
      }
    }

    return NextResponse.json({
      success: true,
      message: `KYC ${status} successfully`,
    });
  } catch (error: any) {
    console.error("Error updating KYC status:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
} 