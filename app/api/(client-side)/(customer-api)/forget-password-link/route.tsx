import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { sendForgotPasswordEmail } from "@/mail-system/authMail";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import PasswordReset from "@/models/ResetPassword";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Connect to MongoDB
    await dbConnect();

    // Check if the email exists in the database
    const user = await Customer.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Check if the user is inactive
    if (user.status === "adminInactive" || user.status === "userInactive") {
      return NextResponse.json({ error: "User is inactive" }, { status: 403 });
    }

    // Generate a unique 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate a unique token
    const resetToken = uuidv4();

    // Calculate expiration time (1 day from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Check if a reset record already exists for this email
    const existingReset = await PasswordReset.findOne({ email });

    if (existingReset) {
      // Update existing reset record
      existingReset.token = resetToken;
      existingReset.code = resetCode;
      existingReset.expiresAt = expiresAt;
      await existingReset.save();
    } else {
      // Create a new reset record
      const passwordReset = new PasswordReset({
        email,
        token: resetToken,
        code: resetCode,
        expiresAt,
      });
      await passwordReset.save();
    }

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    try {
      await sendForgotPasswordEmail(email, resetCode, resetLink);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password reset email sent successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
