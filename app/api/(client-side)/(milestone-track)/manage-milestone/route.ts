import { NextResponse } from "next/server";
import { config } from "@/lib/config";

if (!config.auth.apiKey) {
  throw new Error("API key is not defined in environment variables.");
}

// Your existing code... 