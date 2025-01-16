import { NextResponse } from "next/server";
import Stripe from "stripe";
import { config } from "@/lib/config";

if (!config.stripe.secretKey) {
  throw new Error("Stripe secret key is not defined in environment variables.");
}


export async function POST(req: Request) {
  // Your existing code...
} 