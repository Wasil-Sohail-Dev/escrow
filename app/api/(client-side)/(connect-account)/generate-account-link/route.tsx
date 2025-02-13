import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ConnectAccount } from "@/models/ConnectAccountSchema";

if (
  !process.env.PLATFORM_FEE_STRIPE_SECRET_KEY ||
  !process.env.NEXT_PUBLIC_BASE_URL
) {
  throw new Error("Missing required environment variables.");
}

const stripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required." },
        { status: 400 }
      );
    }

    // Retrieve vendor's Connect account
    const connectAccount = await ConnectAccount.findOne({ vendorId });
    if (!connectAccount) {
      return NextResponse.json(
        { error: "Vendor does not have a Stripe Connect account." },
        { status: 404 }
      );
    }


    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: connectAccount.stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home`,
      type: "account_onboarding",
    });

    return NextResponse.json(
      { success: true, url: accountLink.url },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating account link:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
