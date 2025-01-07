import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { verifyMail } from "@/mail-system/authMail";
import { VerificationCode } from "@/models/Schema";

export async function POST(req: Request) {
  console.log("Connecting to the database...");
  await dbConnect();
  console.log("Database connected.");

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Generate a 6-digit verification code
    const validationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number

    // Calculate expiration time (e.g., 15 minutes from now)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    // Check if a record already exists for the email
    const existingRecord = await VerificationCode.findOne({ email });

    if (existingRecord) {
      // Update the existing record
      existingRecord.code = validationCode.toString();
      existingRecord.expires = expires;
      await existingRecord.save();
      console.log("Existing verification code updated in database.");
    } else {
      // Create a new record
      const newRecord = new VerificationCode({
        email,
        code: validationCode.toString(),
        expires,
      });
      await newRecord.save();
      console.log("New verification code saved to database.");
    }

    // Send the email
    try {
      await verifyMail(email, validationCode);
      console.log("Verification email sent.");
      return NextResponse.json(
        { message: "Verification code sent successfully." },
        { status: 200 }
      );
    } catch (mailError) {
      console.error("Error sending verification email:", mailError);
      return NextResponse.json(
        { error: "Verification code generation failed due to email issue." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
