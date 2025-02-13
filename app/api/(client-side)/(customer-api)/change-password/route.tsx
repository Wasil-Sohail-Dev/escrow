import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import argon2 from "argon2";

export async function PATCH(req: NextRequest) {
  await dbConnect();

  try {
    const { userId, oldPassword, newPassword } = await req.json();

    // Validate input
    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "User ID, old password, and new password are required." },
        { status: 400 }
      );
    }

    // Fetch user from database
    const user = await Customer.findById(userId).select("password");
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Verify the old password
    const isPasswordValid = await argon2.verify(user.password, oldPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect old password." },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update password in the database
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
