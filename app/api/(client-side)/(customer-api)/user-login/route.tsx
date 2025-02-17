import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import argon2 from "argon2";
import { Customer } from "@/models/CustomerSchema";
import { sendMailCode } from "@/lib/actions/auth.action";

export async function POST(req: NextRequest) {
  try {
    const { email, password, onboardingToken } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await Customer.findOne(
      { email },
      "email username password userType userStatus onboardingToken tokenExpiresAt"
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Check if the user is inactive
    if (
      user.userStatus === "adminInactive" ||
      user.userStatus === "userInactive"
    ) {
      return NextResponse.json(
        { error: "Your account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Handle onboarding token authentication
    if (onboardingToken) {
      if (
        user.onboardingToken !== onboardingToken ||
        (user.tokenExpiresAt && new Date() > new Date(user.tokenExpiresAt))
      ) {
        return NextResponse.json(
          { error: "Invalid or expired onboarding token." },
          { status: 403 }
        );
      }

      // Clear onboarding token and expiration date
      user.onboardingToken = null;
      user.tokenExpiresAt = null;
      await user.save();
    } else {
      // Validate password if no onboarding token is provided
      const isValidPassword = await argon2.verify(user.password, password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid credentials." },
          { status: 401 }
        );
      }
    }

    // Generate JWT for mobile authentication
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      userType: user.userType,
      userStatus: user.userStatus,
    };

    const token = jwt.sign(tokenPayload, process.env.NEXTAUTH_SECRET!, {
      expiresIn: "24h",
    });

    if (user.userStatus === "pendingVerification") {
      
      await sendMailCode(email); 
      return NextResponse.json({message: "Verification email has been sent to your email address.", token: null, user: tokenPayload }, { status: 200 });
    }

    if (user.userStatus === "verified") {
      return NextResponse.json({ token:null, user: tokenPayload }, { status: 200 });
    }
    if (user.userStatus === "active") {
      return NextResponse.json({ token, user: tokenPayload }, { status: 200 });
    }

    // return NextResponse.json({ token, user: tokenPayload }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
