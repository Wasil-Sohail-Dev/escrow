import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ConnectAccount } from "@/models/ConnectAccountSchema";

if (!process.env.PLATFORM_FEE_STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is missing.");
}

const stripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

export async function DELETE(req: NextRequest) {
  await dbConnect();

  try {
    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required." },
        { status: 400 }
      );
    }

    // Find the Connect account in the database
    const connectAccount = await ConnectAccount.findOne({ vendorId });
    if (!connectAccount) {
      return NextResponse.json(
        { error: "Vendor does not have a Stripe Connect account." },
        { status: 404 }
      );
    }

    // Attempt to delete the Stripe Connect account
    try {
      await stripe.accounts.del(connectAccount.stripeAccountId);
      console.log(
        `Stripe Connect account ${connectAccount.stripeAccountId} deleted.`
      );

      // Remove the record from the database
      await ConnectAccount.deleteOne({ vendorId });

      return NextResponse.json(
        {
          success: true,
          message: "Stripe Connect account deleted successfully.",
        },
        { status: 200 }
      );
    } catch (stripeError: any) {
      console.error("Error deleting Stripe account:", stripeError);
      return NextResponse.json(
        {
          error:
            stripeError.message || "Failed to delete Stripe Connect account.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting vendor account:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
