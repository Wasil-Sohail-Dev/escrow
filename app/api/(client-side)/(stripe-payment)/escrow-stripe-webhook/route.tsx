import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/paymentSchema";
import { Transaction } from "@/models/TransactionSchema";
import { Contract } from "@/models/ContractSchema";
import { ConnectAccount } from "@/models/ConnectAccountSchema";

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
    bodyParser: false, // Stripe requires raw body
  },
};

// **Helper Function to Fetch Contract Data**
async function fetchContractData(contractId: string) {
  const contract = await Contract.findOne({ contractId }).populate(
    "clientId vendorId"
  );
  if (!contract) throw new Error(`Contract with ID ${contractId} not found.`);
  return contract;
}

// **Helper Function to Create a Transaction**
async function createTransaction({
  contractId,
  paymentId,
  payerId,
  payeeId,
  amount,
  stripeTransferId,
  status,
  type,
}: {
  contractId: string;
  paymentId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  stripeTransferId: string;
  status:
    | "processing"
    | "on_hold"
    | "completed"
    | "failed"
    | "disputed"
    | "refunded"
    | "payout_processing";
  type: "fee" | "funding" | "release" | "refund" | "payout";
}) {
  const transaction = new Transaction({
    contractId,
    paymentId,
    payerId,
    payeeId,
    amount,
    stripeTransferId,
    type,
    status,
  });
  await transaction.save();
}

// **Webhook Event Handlers**
// **1️⃣ Handle PaymentIntent Created (Client Funding Started)**
async function handlePaymentCreated(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent created:", paymentIntent.id);

  const { contractId, platformFee, escrowAmount } =
    paymentIntent.metadata || {};
  if (!contractId || !platformFee || !escrowAmount) return;

  const contract = await fetchContractData(contractId);

  contract.paymentIntentId = paymentIntent.id;
  contract.status = "funding_processing";
  await contract.save();

  await Payment.create({
    contractId: contract._id,
    payerId: contract.clientId._id,
    payeeId: contract.vendorId._id,
    totalAmount: Number(platformFee) + Number(escrowAmount),
    platformFee: Number(platformFee),
    escrowAmount: Number(escrowAmount),
    onHoldAmount: Number(escrowAmount),
    stripePaymentIntentId: paymentIntent.id,
    status: "processing",
  });
}

// **2️⃣ Handle PaymentIntent Authorized (Funds on Hold)**
async function handlePaymentAuthorized(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent authorized:", paymentIntent.id);

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });
  if (!payment) return;

  payment.status = "on_hold";
  await payment.save();

  const contract = await Contract.findById(payment.contractId);
  if (!contract) return;

  contract.status = "funding_onhold";
  await contract.save();
}

// **3️⃣ Handle PaymentIntent Succeeded (Funds Released to Escrow)**
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent succeeded:", paymentIntent.id);

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });
  if (!payment) return;

  payment.status = "funded";
  await payment.save();

  const contract = await Contract.findOne({ contractId: payment.contractId });
  if (contract) {
    contract.status = "active";
    await contract.save();
  }
}

// **4️⃣ Handle Transfers (Escrow → Vendor or Platform Fee)**
async function handleTransfer(transfer: Stripe.Transfer) {
  console.log("Handling Transfer:", transfer.id);

  const { contractId, milestoneId, type } = transfer.metadata || {};
  if (!contractId || !type) {
    return console.error(
      `Transfer ${transfer.id} is missing required metadata.`
    );
  }

  // Fetch contract data
  const contract = await fetchContractData(contractId);
  if (!contract || !contract.clientId || !contract.vendorId) {
    return console.error(
      `Contract ${contractId} not found or missing client/vendor.`
    );
  }

  // Fetch payment record
  const payment = await Payment.findOne({ contractId: contract._id });
  if (!payment) {
    return console.error(`Payment not found for contract ${contractId}.`);
  }

  // Create transaction record
  const transactionData: any = {
    contractId: contract._id,
    paymentId: payment._id,
    payerId: contract.clientId._id, // Extract `_id`
    payeeId: contract.vendorId._id, // Extract `_id`
    amount: transfer.amount / 100,
    stripeTransferId: transfer.id,
    type: type as "fee" | "funding" | "release" | "refund" | "payout",
    status: "completed",
  };

  // If the transfer is related to a milestone release, add milestoneId
  if (type === "release" && milestoneId) {
    transactionData.milestoneId = milestoneId;

    // Find and update the specific milestone's status in the contract
    const milestoneIndex = contract.milestones.findIndex(
      (m: any) => m.milestoneId === milestoneId
    );

    if (milestoneIndex !== -1) {
      contract.milestones[milestoneIndex].status = "payment_released";
      await contract.save();
      console.log(
        `Milestone ${milestoneId} status updated to "payment_released".`
      );
    } else {
      console.error(
        `Milestone ${milestoneId} not found in contract ${contractId}.`
      );
    }
  }

  // Save transaction record
  await createTransaction(transactionData);

  console.log(`Transaction recorded for Transfer ${transfer.id}.`);
}

// **5️⃣ Handle Payout Created (Funds Sent to Vendor Bank)**
async function handlePayoutCreated(payout: Stripe.Payout) {
  console.log("Handling Payout Created:", payout.id);

  const { contractId } = payout.metadata || {};
  if (!contractId)
    return console.error(`Payout ${payout.id} missing contractId in metadata.`);

  const contract = await fetchContractData(contractId);
  if (!contract || !contract.clientId || !contract.vendorId) {
    return console.error(
      `Contract ${contractId} not found or missing client/vendor.`
    );
  }

  const payement = await Payment.findOne({ contractId: contract._id });
  if (!payement) {
    return console.error(`Payment not found for contract ${contractId}.`);
  }

  await createTransaction({
    contractId: contract._id,
    paymentId: payement._id,
    payerId: contract.clientId._id,
    payeeId: contract.vendorId._id,
    amount: payout.amount / 100,
    stripeTransferId: payout.id,
    type: "payout",
    status: "payout_processing",
  });
}

// **6️⃣ Handle Payout Paid (Vendor Received Bank Payment)**
async function handlePayoutPaid(payout: Stripe.Payout) {
  console.log("Handling Payout Paid:", payout.id);

  await Transaction.findOneAndUpdate(
    { stripeTransferId: payout.id },
    { status: "completed" }
  );
}

// **7️⃣ Handle Payout Failed (Bank Rejected Payout)**
async function handlePayoutFailed(payout: Stripe.Payout) {
  console.log("Handling Payout Failed:", payout.id);

  await Transaction.findOneAndUpdate(
    { stripeTransferId: payout.id },
    { status: "failed" }
  );
}

// **8️⃣ Handle Payment Failed**
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent failed:", paymentIntent.id);

  await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { status: "failed" }
  );
}

// **9️⃣ Handle Payment Canceled**
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log("Handling PaymentIntent canceled:", paymentIntent.id);

  await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { status: "refunded" }
  );
}

// **10️⃣ Handle Account Updated**
// **Handle Vendor Stripe Account Updates**
async function handleAccountUpdated(account: Stripe.Account) {
  console.log("Handling account update:", account.id);

  const {
    id: stripeAccountId,
    payouts_enabled,
    charges_enabled,
    requirements,
  } = account;

  // Check verification & payout status
  const verificationStatus =
    requirements?.currently_due?.length === 0 ? "verified" : "pending";
  const payoutStatus = payouts_enabled ? "enabled" : "disabled";

  // Find vendor's ConnectAccount in DB and update it
  const updatedAccount = await ConnectAccount.findOneAndUpdate(
    { stripeAccountId },
    { verificationStatus, payoutStatus, chargesEnabled: charges_enabled },
    { new: true }
  );

  if (updatedAccount) {
    console.log(`Updated Connect Account ${stripeAccountId}:`, updatedAccount);
  } else {
    console.error(`Connect Account ${stripeAccountId} not found.`);
  }
}
// **Main Webhook Handler**
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
      { error: "Webhook verification failed." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // Payment Intent Events
      case "payment_intent.created":
        await handlePaymentCreated(event.data.object);
        break;
      case "payment_intent.amount_capturable_updated":
        await handlePaymentAuthorized(event.data.object);
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

      // Transfer Events
      case "transfer.created":
        await handleTransfer(event.data.object);
        break;

      // Payout Events
      case "payout.created":
        await handlePayoutCreated(event.data.object);
        break;
      case "payout.paid":
        await handlePayoutPaid(event.data.object);
        break;
      case "payout.failed":
        await handlePayoutFailed(event.data.object);
        break;

      // Account Events
      case "account.updated":
        await handleAccountUpdated(event.data.object);
        break;

      // Default
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error processing event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
