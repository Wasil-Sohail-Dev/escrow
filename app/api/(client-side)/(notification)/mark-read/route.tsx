import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Notification } from "@/models/NotificationSchema";

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { notificationId, action } = body;

    // Validate action
    if (!["markAsRead", "markAsUnread"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'markAsRead' or 'markAsUnread'." },
        { status: 400 }
      );
    }

    // Find the notification by ID
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      );
    }

    // Update the read status based on the action
    notification.isRead = action === "markAsRead";
    await notification.save();

    return NextResponse.json(
      {
        message: `Notification ${
          action === "markAsRead" ? "marked as read" : "marked as unread"
        }.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
