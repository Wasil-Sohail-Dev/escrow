import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Notification } from "@/models/NotificationSchema";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { receiverId, status, limit } = await req.json();
    
    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required." },
        { status: 400 }
      );
    }

    const filter: any = { receiverId };
    if (status) filter.status = status;

    let query = Notification.find(filter).sort({ createdAt: -1 });
    
    if (limit&&limit !== "all") {
      query = query.limit(limit);
    }

    const notifications = await query;

    return NextResponse.json({ success: true, notifications }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
