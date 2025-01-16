import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { contractId, action } = body;

    // Validate action
    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'." },
        { status: 400 }
      );
    }

    // Find the contract by contractId
    const contract = await Contract.findOne({ contractId });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found." },
        { status: 404 }
      );
    }

    // Check if the contract is in a valid state for action
    if (contract.status === "funding_pending") {
      return NextResponse.json(
        {
          error: `Contract is already onboard.`,
        },
        { status: 400 }
      );
    }

    // Check if the contract is in a valid state for action
    if (contract.status !== "onboarding") {
      return NextResponse.json(
        {
          error: `Action not allowed. Contract is currently in '${contract.status}' state.`,
        },
        { status: 400 }
      );
    }

    // Handle the action
    if (action === "accept") {
      contract.status = "funding_pending"; // Update the status to onboarding
      await contract.save();
      return NextResponse.json(
        { message: "Invitation accepted. Contract is now onboard." },
        { status: 200 }
      );
    }

    if (action === "reject") {
      contract.status = "cancelled"; // Update the status to cancelled
      await contract.save();
      return NextResponse.json(
        { message: "Invitation rejected. Contract has been cancelled." },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
