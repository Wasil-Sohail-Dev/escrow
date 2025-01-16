import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { MilestoneHistory } from "@/models/MilestoneHistorySchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const milestoneId = searchParams.get("milestoneId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!milestoneId) {
      return NextResponse.json(
        { success: false, message: "Milestone ID is required." },
        { status: 400 }
      );
    }

    // Fetch the milestone history with pagination
    const history = await MilestoneHistory.find({ milestoneId })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await MilestoneHistory.countDocuments({ milestoneId });

    return NextResponse.json(
      {
        success: true,
        data: history,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
