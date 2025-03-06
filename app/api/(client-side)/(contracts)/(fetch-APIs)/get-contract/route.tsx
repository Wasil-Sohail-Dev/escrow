import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";
import { Milestone } from "@/lib/helpers/calculateProgress";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");

    // Check if contractId is provided
    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required as a query parameter." },
        { status: 422 }
      );
    }

    // Fetch the contract from the database
    const contract = await Contract.findOne({ contractId }).populate([
      { path: "clientId", select: "userName email" }, // Populate client details
      { path: "vendorId", select: "userName email" }, // Populate vendor details
    ]);

    if (!contract) {
      return NextResponse.json(
        { error: `No contract found with contractId: ${contractId}` },
        { status: 404 }
      );
    }

    // Define milestone status progression
    const statusPercentageMap = {
      pending: 0,
      working: 25,
      ready_for_review: 50,
      change_requested: 65,
      approved: 85,
      payment_released: 100,
      disputed: 50,
      disputed_in_process: 50,
      disputed_resolved: 75,
    } as const;

    type MilestoneStatus = keyof typeof statusPercentageMap;

    // Add completion percentage to each milestone
    const contractWithPercentages = {
      ...contract.toObject(),
      milestones: contract.milestones.map((milestone:any) => {
        const milestoneObj = milestone.toObject ? milestone.toObject() : milestone;
        return {
          ...milestoneObj,
          completionPercentage: statusPercentageMap[milestoneObj.status as MilestoneStatus] || 0
        };
      })
    };

    return NextResponse.json(
      {
        message: "Contract details retrieved successfully.",
        data: contractWithPercentages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching contract details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
