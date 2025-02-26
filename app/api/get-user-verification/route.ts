import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { KycVerification } from "@/models/KycVerificationSchema";
import { Admin } from "@/models/AdminSchema";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Customer ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the latest verification record for the customer
    let verification = await KycVerification.findOne(
      { customerId },
      {},
      { sort: { createdAt: -1 } }
    );

    // Default values when no verification exists
    const defaultVerification = {
      isKycApproved: false,
      kycDescription: "",
      isBlocked: false,
      blockReason: "",
      verifiedBy: null,
      verifiedAt: null
    };

    // If verification exists and has verifiedBy, populate admin details
    if (verification?.verifiedBy) {
      try {
        const admin = await Admin.findById(verification.verifiedBy).select('firstName lastName email');
        if (admin) {
          verification = verification.toObject();
          verification.verifiedBy = admin;
        }
      } catch (error) {
        console.error("Error populating admin:", error);
      }
    }

    return NextResponse.json({
      success: true,
      data: verification ? {
        isKycApproved: verification.isKycApproved,
        kycDescription: verification.kycDescription,
        isBlocked: verification.isBlocked,
        blockReason: verification.blockReason,
        verifiedBy: verification.verifiedBy,
        verifiedAt: verification.verifiedAt,
      } : defaultVerification
    });
  } catch (error: any) {
    console.error("Error fetching verification:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 