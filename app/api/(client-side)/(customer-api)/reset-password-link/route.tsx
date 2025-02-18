import { NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import PasswordReset from "@/models/ResetPassword";

export async function POST(req: Request) {
  console.log("Reset password API triggered");

  try {
    const { token, code, newPassword } = await req.json();

    // Validate input: newPassword is required, and either token or code must be provided
    if (!newPassword || (!token && !code)) {
      return NextResponse.json(
        { error: "New password and either token or code are required." },
        { status: 422 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    let resetRecord;

    // Check if token is provided and valid
    if (token) {
      resetRecord = await PasswordReset.findOne({
        token,
        expiresAt: { $gt: new Date() }, // Ensure token is not expired
      });
    }
    // Otherwise, check if the 6-digit code is provided and valid
    else if (code) {
      resetRecord = await PasswordReset.findOne({
        code,
        expiresAt: { $gt: new Date() }, // Ensure code is not expired
      });
    }

    console.log("Reset record found:", resetRecord); // Debug log

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token/code." },
        { status: 400 }
      );
    }

    // Get the user's email from the reset record
    const email = resetRecord.email;

    // Find the user by email
    const user = await Customer.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Hash the new password using Argon2
    const hashedPassword = await argon2.hash(newPassword);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the password reset record (since it was used)
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
