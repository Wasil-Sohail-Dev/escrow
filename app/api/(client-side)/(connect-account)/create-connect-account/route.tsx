import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { ConnectAccount } from "@/models/ConnectAccountSchema";

// Initialize Stripe
if (!process.env.PLATFORM_FEE_STRIPE_SECRET_KEY) {
  throw new Error("PLATFORM_FEE_STRIPE_SECRET_KEY is not defined.");
}
const stripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { vendorId, country, email } = await req.json();
    if (!vendorId || !country || !email) {
      return NextResponse.json(
        { error: "Vendor ID, country, and email are required." },
        { status: 400 }
      );
    }

    // Check if vendor exists
    const vendor = await Customer.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
    }

    // Check if vendor already has a Connect account
    let connectAccount = await ConnectAccount.findOne({ vendorId });

    if (connectAccount) {
      return NextResponse.json(
        {
          message: "Vendor already has a Stripe Connect account.",
          stripeAccountId: connectAccount.stripeAccountId,
          verificationStatus: connectAccount.verificationStatus,
        },
        { status: 200 }
      );
    }

    // **Create a Stripe Express Connect account**
    const account = await stripe.accounts.create({
      type: "express",
      country: country, // e.g., "US", "GB", "IN"
      email: email,
      business_type: "individual",
      capabilities: { transfers: { requested: true } },
    });

    // Save Connect Account in the database
    connectAccount = await ConnectAccount.create({
      vendorId: vendor._id,
      stripeAccountId: account.id,
      country: country,
      verificationStatus: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        stripeAccountId: account.id,
        verificationStatus: "pending",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating Stripe Connect account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
