import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ContactMessage } from "@/models/ContactMessageSchema";
import { sendContactUsMail } from "@/mail-system/sendMail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, email, phone, message } = await req.json();

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Save the message to the database
    await ContactMessage.create({
      name,
      email,
      phone,
      message,
    });

    await sendContactUsMail(name, email, message, phone);

    return NextResponse.json(
      { success: true, message: "Message sent successfully." },
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
