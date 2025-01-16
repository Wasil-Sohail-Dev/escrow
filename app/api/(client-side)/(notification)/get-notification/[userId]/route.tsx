import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Notification } from "@/models/NotificationSchema";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  try {
    const { userId } = params;

    // Fetch notifications for the user from the database
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    if (!notifications || notifications.length === 0) {
      return NextResponse.json(
        { message: "No notifications found for this user." },
        { status: 404 }
      );
    }

    return NextResponse.json(notifications, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
