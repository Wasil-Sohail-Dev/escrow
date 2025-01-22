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

    // Generate a unique token
    const resetToken = uuidv4();

    // Calculate expiration time (1 day from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Save the token and expiration in the database
    const passwordRest = new PasswordReset({
      email,
      token: resetToken,
      expiresAt,
    });
    const savedPasswordReset = await passwordRest.save();

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    try {
      await sendForgotPasswordEmail(email, resetLink);
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
