import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { FcmToken } from "@/models/FcmTokenSchema";
import { Notification } from "@/models/NotificationSchema";
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./firebase.json";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const {
      senderId, // Optional
      receiverId,
      title,
      message,
      type,
      severity = "info", // Default value
      link,
      meta,
    } = await req.json();

    // **Validation: Required Fields**
    if (!receiverId || !title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields: receiverId, title, message, type." },
        { status: 400 }
      );
    }

    // **Find User's FCM Token**
    const userToken = await FcmToken.findOne({ userId: receiverId });

    if (!userToken) {
      console.warn(
        `FCM token not found for user ${receiverId}. Notification stored but not sent.`
      );
      // Proceed to store the notification in DB even if FCM token is missing
    }

    // **Prepare Notification Data**
    const notificationData: any = {
      receiverId,
      title,
      message,
      type,
      severity,
      status: "unread",
      createdAt: new Date(),
    };

    if (senderId) notificationData.senderId = senderId;
    if (link) notificationData.link = link;
    if (meta) notificationData.meta = meta;

    // **Save Notification in DB**
    await Notification.create(notificationData);

    // **Only Send FCM Notification if User has FCM Token**
    if (userToken) {
      const payload = {
        token: userToken.fcmToken,
        notification: { title, body: message },
        data: {
          type,
          severity,
          link: link || "",
        },
      };

      await admin.messaging().send(payload);
    }

    return NextResponse.json(
      { success: true, message: "Notification processed successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing notification:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
