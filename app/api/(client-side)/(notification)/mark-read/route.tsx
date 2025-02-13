import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Notification } from "@/models/NotificationSchema";

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required." },
        { status: 400 }
      );
    }

    await Notification.findByIdAndUpdate(notificationId, { status: "read" });

    return NextResponse.json(
      { success: true, message: "Notification marked as read." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
