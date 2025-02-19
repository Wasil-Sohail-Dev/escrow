import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";

export async function POST(req: Request) {
  await dbConnect();
  console.log("Database connected for onboarding.");

  try {
    const data = await req.json();
    console.log(data);
    const {
      email,
      userType,
      firstName,
      lastName,
      userName,
      phone,
      companyName,
      companyAddress,
    } = data;

    // Validate required fields
    if (!email || !userType || !firstName || !lastName || !userName || !phone) {
      return NextResponse.json(
        { error: "All required fields must be provided." },
        { status: 400 }
      );
    }

    // Validate user type
    const validUserTypes = ["vendor", "client"];
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        { error: "Invalid user type." },
        { status: 400 }
      );
    }

    // Fetch user from the database
    const user = await Customer.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check user status
    if (
      user.userStatus === "adminInactive" ||
      user.userStatus === "userInactive"
    ) {
      return NextResponse.json(
        { error: "User is not active." },
        { status: 403 }
      );
    }

    // Ensure onboarding
    if (user.userStatus === "active") {
      return NextResponse.json(
        { error: "User Already onBoard and Active" },
        { status: 200 }
      );
    }

    // Ensure email is verified before onboarding
    if (user.userStatus !== "verified") {
      return NextResponse.json(
        { error: "Please verify your email first." },
        { status: 403 }
      );
    }

    // Validate vendor-specific fields
    if (userType === "vendor" && (!companyName || !companyAddress)) {
      return NextResponse.json(
        { error: "Company name and address are required for vendors." },
        { status: 400 }
      );
    }

    // Generate onboarding token and expiration
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token expires in 15 minutes

    // Update user data with onboarding info
    user.firstName = firstName;
    user.lastName = lastName;
    user.userName = userName;
    user.phone = phone;

    if (userType === "vendor") {
      user.companyName = companyName;
      user.companyAddress = companyAddress;
    }

    // Save onboarding token and expiration date
    user.onboardingToken = token;
    user.tokenExpiresAt = tokenExpiresAt;

    // Update userStatus to active
    user.userStatus = "active";

    // Save updated user information
    await user.save();

    console.log("User onboarding data updated successfully.");
    return NextResponse.json(
      {
        message: "Onboarding completed successfully.",
        user: {
          email: user.email,
          userStatus: user.userStatus,
          onboardingToken: token,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error handling onboarding data:", error);

    // Handle MongoDB duplicate key error (error code 11000)
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyValue)[0]; // Get which field caused the duplication
      return NextResponse.json(
        {
          error: `${duplicateKey} already exists. Please use a different one.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
