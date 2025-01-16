import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { VerificationCode } from "@/models/VerificationSchema";

export async function POST(req: Request) {
  await dbConnect();
  console.log("Database connected.");

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    // Find the verification record
    const verificationRecord = await VerificationCode.findOne({ email, code });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "Invalid email or code." },
        { status: 400 }
      );
    }

    // Check if the code has expired
    if (verificationRecord.expires < new Date()) {
      return NextResponse.json(
        { error: "The verification code has expired." },
        { status: 400 }
      );
    }

    // Update user status to 'verified'
    await Customer.updateOne({ email }, { $set: { userStatus: "verified" } });

    // Delete the verification record
    await VerificationCode.deleteOne({ email, code });

    return NextResponse.json(
      { message: "Verification successful." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying the code:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
