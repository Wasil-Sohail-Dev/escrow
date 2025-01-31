import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/paymentSchema";
import { Contract } from "@/models/ContractSchema";

// Initialize Stripe
if (
  !process.env.PLATFORM_FEE_STRIPE_SECRET_KEY ||
  !process.env.PLATFORM_STRIPE_WEBHOOK_SECRET
) {
  throw new Error("Stripe secret key is not defined in environment variables.");
}
const stripe = new Stripe(process.env.PLATFORM_FEE_STRIPE_SECRET_KEY);

const endpointSecret = process.env.PLATFORM_STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // Stripe requires the raw body
  },
};

// In-memory rate limiter
const rateLimitCache = new Map();

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

function rateLimit(key: string, limit: number, ttl: number): boolean {
  const now = Date.now();
  const entry: RateLimitEntry | undefined = rateLimitCache.get(key);

  if (entry) {
    if (entry.count >= limit) {
      // Check if TTL has expired
      if (now - entry.timestamp > ttl * 1000) {
        // Reset the count and timestamp
        rateLimitCache.set(key, { count: 1, timestamp: now });
        return true;
      }
      return false;
    }

    // Increment count
    entry.count += 1;
    return true;
  }

  // First request
  rateLimitCache.set(key, { count: 1, timestamp: now });
  return true;
}

// Helper Functions for Business Logic
async function handlePaymentCreated(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent created:", paymentIntent.id);

  const { contractId, platformFee, escrowAmount } =
    paymentIntent.metadata || {};

  if (!contractId || !platformFee || !escrowAmount) {
    console.error(
      `Invalid metadata in PaymentIntent ${paymentIntent.id}:`,
      paymentIntent.metadata
    );
    return;
  }

  // Find the existing payment or create a new one
  const existingPayment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (existingPayment) {
    // Update the status and timestamps
    existingPayment.status = "process";
    existingPayment.updatedAt = new Date();
    await existingPayment.save();
    console.log(`PaymentIntent ${paymentIntent.id} status updated to process.`);
  } else {
    console.error(
      `PaymentIntent ${paymentIntent.id} not found in the database.`
    );
    return;
  }

  // Update the contract status to "funding_processing"
  const contract = await Contract.findOne({ contractId });
  if (contract) {
    contract.status = "funding_processing";
    await contract.save();
    console.log(`Contract ${contractId} status updated to funding_processing.`);
  } else {
    console.error(`Contract ${contractId} not found.`);
  }
}

// Helper Functions for Business Logic when payment is authhorized from client
async function handlePaymentFunding(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent funding:", paymentIntent.id);

  const { contractId, platformFee, escrowAmount } =
    paymentIntent.metadata || {};

  if (!contractId || !platformFee || !escrowAmount) {
    console.error(
      `Invalid metadata in PaymentIntent ${paymentIntent.id}:`,
      paymentIntent.metadata
    );
    return;
  }

  // Find the existing payment or create a new one
  const existingPayment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (existingPayment) {
    // Update the status and timestamps
    existingPayment.status = "on_hold";
    existingPayment.updatedAt = new Date();
    await existingPayment.save();
    console.log(`PaymentIntent ${paymentIntent.id} status updated to on_hold.`);
  } else {
    console.error(
      `PaymentIntent ${paymentIntent.id} not found in the database.`
    );
    return;
  }

  // Update the contract status to "funding_processing"
  const contract = await Contract.findOne({ contractId });
  if (contract) {
    contract.status = "funding_onhold";
    await contract.save();
    console.log(`Contract ${contractId} status updated to funding_onhold.`);
  } else {
    console.error(`Contract ${contractId} not found.`);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent succeeded:", paymentIntent.metadata);

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    console.error(
      `Payment record not found for PaymentIntent ID: ${paymentIntent.id}`
    );
    return;
  }

  payment.status = "funded";
  payment.updatedAt = new Date();
  await payment.save();

  const contract = await Contract.findOne({
    contractId: paymentIntent.metadata.contractId,
  });

  if (contract) {
    contract.status = "active";
    await contract.save();
  }

  console.log(`PaymentIntent ${paymentIntent.id} succeeded and recorded.`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent failed:", paymentIntent.id);

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (payment) {
    payment.status = "failed";
    payment.updatedAt = new Date();
    await payment.save();
  }

  const contract = await Contract.findOne({
    contractId: paymentIntent.metadata.contractId,
  });

  if (contract) {
    contract.status = "funding_pending";
    await contract.save();
  }

  console.error(`PaymentIntent ${paymentIntent.id} failed.`);
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent canceled:", paymentIntent.id);

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (payment) {
    payment.status = "refunded";
    payment.updatedAt = new Date();
    await payment.save();
  }

  const contract = await Contract.findOne({
    contractId: paymentIntent.metadata.contractId,
  });

  if (contract) {
    contract.status = "funding_pending";
    await contract.save();
    console.log(`PaymentIntent ${paymentIntent.id} canceled and refunded.`);
  }
}

// Main Webhook Handler
export async function POST(req: NextRequest) {
  await dbConnect();

  const sig = req.headers.get("stripe-signature");

  if (!endpointSecret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 }
    );
  }

  let event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig || "", endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  const rateLimitKey = `rate-limit:${event.type}:${event.id}`;
  const allowed = rateLimit(rateLimitKey, 5, 60); // 5 requests per minute

  if (!allowed) {
    console.warn(
      `Rate limit exceeded for event ${event.type}, ID: ${event.id}`
    );
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.created":
        await handlePaymentCreated(event.data.object);
        break;
      case "payment_intent.amount_capturable_updated":
        await handlePaymentFunding(event.data.object);
        break;
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error handling Stripe event: ${err.message}`);
    return NextResponse.json(
      { error: `Error handling event: ${err.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
