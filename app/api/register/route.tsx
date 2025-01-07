// pages/api/auth/register.js

import { NextResponse } from "next/server";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import { sendMailCode } from "@/lib/actions/auth.action";
import { Customer } from "@/models/Schema";

// Ensure NEXTAUTH_SECRET is not undefined
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET is not defined. Please set it in your environment variables."
  );
}

const TOKEN_EXPIRY = "1h"; // Token valid for 1 hour

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password, userType } = await req.json();

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return NextResponse.json(
        { error: "Email already in use." },
        { status: 409 }
      );
    }

    const hashedPassword = await argon2.hash(password);

    const newCustomer = new Customer({
      email,
      password: hashedPassword,
      userType,
      userStatus: "pendingVerification",
    });

    const savedCustomer = await newCustomer.save();

    // Generate a JWT token with user ID and email
    const token = jwt.sign(
      { userId: savedCustomer._id, email: savedCustomer.email },
      NEXTAUTH_SECRET as string,
      { expiresIn: TOKEN_EXPIRY }
    );


    // Send verification email with token (or a code)
    // await sendMailCode(email); // Adjust to send token/code in the email

    // Respond with token
    return NextResponse.json(
      {
        message: "Registration successful. Please verify your email.",
        data: { token, email: savedCustomer.email, userStatus: savedCustomer.userStatus },
      },
      { status: 201 } // Set status code to 201
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
