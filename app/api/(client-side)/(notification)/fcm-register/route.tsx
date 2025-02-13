import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { FcmToken } from "@/models/FcmTokenSchema";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { userId, fcmToken, deviceType } = await req.json();
    if (!userId || !fcmToken || !deviceType) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    await FcmToken.findOneAndUpdate(
      { userId },
      { fcmToken, deviceType },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, message: "FCM token registered successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
