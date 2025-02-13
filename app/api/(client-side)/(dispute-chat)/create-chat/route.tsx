import { NextResponse } from "next/server";
import { ChatSystem } from "@/models/ChatSystem";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { sendNotification } from "@/lib/actions/sender.action";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { disputeId, participants } = await request.json();

    // Validate request body
    if (!disputeId || !participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { error: "Dispute ID and participants are required." },
        { status: 400 }
      );
    }

    // Create a new chat session
    const newChat = await ChatSystem.create({
      disputeId,
      participants,
      messages: [],
    });

    // **📌 Notify Client, Vendor, and Admin**
    try {
      // Fetch the client, vendor, and admin details
      const users = await Customer.find({ _id: { $in: participants } });

      const client = users.find((user) => user.userType === "client");
      const vendor = users.find((user) => user.userType === "vendor");
      const admin = await Customer.findOne({ userType: "admin" }); // Fetch the admin

      if (client) {
        await sendNotification({
          receiverId: client._id.toString(),
          title: "Dispute Raised",
          message: "A dispute has been raised for one of your contracts.",
          type: "alert",
          severity: "warning",
          link: `/disputes/${disputeId}`,
          meta: { disputeId },
        });
      }

      if (vendor) {
        await sendNotification({
          receiverId: vendor._id.toString(),
          title: "Dispute Raised",
          message:
            "A dispute has been filed for a contract you're involved in.",
          type: "alert",
          severity: "warning",
          link: `/disputes/${disputeId}`,
          meta: { disputeId },
        });
      }

      if (admin) {
        await sendNotification({
          receiverId: admin._id.toString(),
          title: "New Dispute Alert",
          message: "A new dispute has been raised. Please review it.",
          type: "system",
          severity: "error",
          link: `/admin/disputes/${disputeId}`,
          meta: { disputeId },
        });
      }
    } catch (notificationError) {
      console.error("Error sending dispute notifications:", notificationError);
    }

    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
