import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { sendMailCode } from "@/lib/actions/auth.action";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await Customer.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.userStatus === "verified") {
      return NextResponse.json(
        { error: "User is already verified." },
        { status: 400 }
      );
    }

    // Check for rate limiting (prevent spam)
    const lastOtpSentTime = user.lastOtpSentAt ? new Date(user.lastOtpSentAt) : new Date(0);
    const timeDifference = Date.now() - lastOtpSentTime.getTime();
    const minimumWaitTime = 60 * 1000; // 1 minute in milliseconds

    if (timeDifference < minimumWaitTime) {
      const remainingTime = Math.ceil((minimumWaitTime - timeDifference) / 1000);
      return NextResponse.json(
        { 
          error: `Please wait ${remainingTime} seconds before requesting another OTP.`,
          remainingTime 
        },
        { status: 429 }
      );
    }

    // Send new OTP
    await sendMailCode(email);

    // Update last OTP sent time
    await Customer.findOneAndUpdate(
      { email },
      { lastOtpSentAt: new Date() }
    );

    return NextResponse.json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend OTP." },
      { status: 500 }
    );
  }
} 