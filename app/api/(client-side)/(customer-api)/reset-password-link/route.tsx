import { NextResponse } from "next/server";
import crypto from "crypto";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import PasswordReset from "@/models/ResetPassword";

export async function POST(req: Request) {
    console.log("working");
    
  try {
    const { token, newPassword } = await req.json();

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 422 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find the password reset record with the raw token
    const resetRecord = await PasswordReset.findOne({
      token: token,  // Use the raw token directly since it's stored unhashed
      expiresAt: { $gt: new Date() }, // Ensure token is not expired
    });

    console.log("Reset record found:", resetRecord); // Debug log

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await Customer.findOne({ email: resetRecord.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Hash the new password using Argon2
    const hashedPassword = await argon2.hash(newPassword);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the password reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}