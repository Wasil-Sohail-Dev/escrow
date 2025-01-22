import { NextResponse } from "next/server";
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./firebase.json";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
}

export async function POST(request: Request) {
  try {
    const { fcmToken, title, body } = await request.json();

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK", // Custom data for handling in-app
      },
    };

    const response = await admin.messaging().send(message);

    console.log("Notification sent successfully:", response);

    return NextResponse.json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
