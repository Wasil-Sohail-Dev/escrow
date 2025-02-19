import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import argon2 from "argon2";

export async function POST(req: Request) {
  try {
    const { customerId, password } = await req.json();

    // Validate input
    if (!customerId || !password) {
      return NextResponse.json(
        { error: "customerId and password are required." },
        { status: 422 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find the user by ID
    const user = await Customer.findById(customerId);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if the user is already inactive
    if (
      user.userStatus === "userInactive" ||
      user.userStatus === "adminInactive"
    ) {
      return NextResponse.json(
        { message: "Account is already deactivated." },
        { status: 200 }
      );
    }

    // Verify the password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    // Update the user's status to 'userInactive'
    user.userStatus = "userInactive";
    await user.save();

    return NextResponse.json(
      { message: "Account successfully deactivated." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in delete account API:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
