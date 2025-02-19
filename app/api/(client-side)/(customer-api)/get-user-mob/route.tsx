import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { ConnectAccount } from "@/models/ConnectAccountSchema";
import Stripe from "stripe";

if (!process.env.PLATFORM_FEE_STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is missing.");
}

const stripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
  await dbConnect();
  console.log("Database connected.");

  try {
    // Get email from query params
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    let userData = await Customer.findOne({ email }).select(
      "-password -onboardingToken -tokenExpiresAt"
    );

    if (!userData) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (
      userData.userStatus === "adminInactive" ||
      userData.userStatus === "userInactive"
    ) {
      return NextResponse.json(
        { error: "User is not active." },
        { status: 403 }
      );
    }

    // **Check Stripe Connect Account if user is a vendor**
    let verificationStatus = "not_created"; // Default status

    if (userData.userType === "vendor") {
      const connectAccount = await ConnectAccount.findOne({
        vendorId: userData._id,
      });

      if (connectAccount) {
        try {
          // Fetch latest account status from Stripe
          const stripeAccount = await stripe.accounts.retrieve(
            connectAccount.stripeAccountId
          );
          verificationStatus = stripeAccount.details_submitted
            ? "verified"
            : "pending";

          // Update status in DB if changed
          if (connectAccount.verificationStatus !== verificationStatus) {
            connectAccount.verificationStatus = verificationStatus;
            await connectAccount.save();
          }
        } catch (stripeError: any) {
          console.error("Error fetching Stripe account:", stripeError);
          verificationStatus = "error";
        }
      }
    }

    // Convert Mongoose object to a plain JavaScript object and add verificationStatus
    userData = userData.toObject();
    userData.verificationStatus = verificationStatus;

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
