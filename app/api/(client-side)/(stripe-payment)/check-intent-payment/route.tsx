import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/paymentSchema";
import { Contract } from "@/models/ContractSchema"; // Assuming you have a Contract model
import Stripe from "stripe";

if (!process.env.PLATFORM_FEE_STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is not defined in environment variables.");
}
const stripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { contractId } = await req.json();

    if (!contractId) {
      return NextResponse.json(
        { error: "Contract ID is required." },
        { status: 400 }
      );
    }

    // Fetch the Contract document by its contractId field
    const contract = await Contract.findOne({ contractId });

    if (!contract) {
      return NextResponse.json(
        { error: "No contract found with the provided ID." },
        { status: 404 }
      );
    }

    // Use the Contract's _id to find the corresponding Payment
    const payment = await Payment.findOne({
      contractId: contract._id,
      status: "processing",
    });

    if (!payment) {
      // No active PaymentIntent found, update contract status if necessary
      if (contract.status === "funding_processing") {
        contract.status = "funding_pending";
        await contract.save();
        return NextResponse.json(
          {
            message:
              "No active PaymentIntent found. Contract status updated to 'funding_pending'.",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          message: "No active PaymentIntent found, no status update required.",
        },
        { status: 404 }
      );
    }

    // Retrieve the PaymentIntent from Stripe using the PaymentIntent ID
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.stripePaymentIntentId
    );

    if (!paymentIntent) {
      // If PaymentIntent not found, update contract status if necessary
      if (contract.status === "funding_processing") {
        contract.status = "funding_pending";
        await contract.save();
        return NextResponse.json(
          {
            message:
              "PaymentIntent not found. Contract status updated to 'funding_pending'.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "PaymentIntent not found.",
          status: "No status update required.",
        },
        { status: 404 }
      );
    }

    // Return the clientSecret to the frontend
    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}