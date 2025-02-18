import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PasswordReset from "@/models/ResetPassword";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // Connect to MongoDB
    await dbConnect();

    // Find the reset record by email and code
    const resetRecord = await PasswordReset.findOne({ email, code });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if the code is expired
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // If the code is valid, return success message
    return NextResponse.json(
      { message: "Verification successful! You can now reset your password." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
