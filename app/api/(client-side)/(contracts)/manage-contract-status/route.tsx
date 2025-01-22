import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";

interface Milestone {
  milestoneId: string;
  title: string;
  amount: number;
  description?: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
}

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { contractId, contractStatus, milestoneStatus } = body;

    // Validate input
    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required." },
        { status: 422 }
      );
    }

    if (!contractStatus && !milestoneStatus) {
      return NextResponse.json(
        {
          error:
            "At least one of contractStatus or milestoneStatus is required.",
        },
        { status: 422 }
      );
    }

    const contract = await Contract.findOne({ contractId });

    if (!contract) {
      return NextResponse.json(
        { error: `No contract found with ID: ${contractId}` },
        { status: 404 }
      );
    }

    // Ensure the contract's current status is `funding_onhold`
    if (contract.status !== "funding_onhold") {
      return NextResponse.json(
        { error: "Contract status must be 'funding_onhold' to update." },
        { status: 400 }
      );
    }

    // Update contract status
    if (contractStatus) {
      contract.status = contractStatus;
    }

    // Update milestone status
    if (milestoneStatus) {
      const firstPendingMilestone = contract.milestones.find(
        (milestone: Milestone) => milestone.status === "pending"
      );

      if (!firstPendingMilestone) {
        return NextResponse.json(
          { error: "No pending milestone found to update." },
          { status: 404 }
        );
      }

      firstPendingMilestone.status = milestoneStatus;
    }

    await contract.save();

    return NextResponse.json(
      {
        message: "Contract and milestone statuses updated successfully.",
        data: contract,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error managing contract:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
