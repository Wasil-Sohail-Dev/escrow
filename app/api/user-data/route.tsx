import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/Schema";

export async function GET(req: Request) {
  await dbConnect();
  console.log("Database connected.");

  try {
    const query = new URL(req.url).searchParams;
    const email = query.get("email");
    console.log("email", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Fetch user data from the customer collection
    const userData = await Customer.findOne({ email });
    if (!userData) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (
      userData.status === "adminInactive" ||
      userData.status === "userInactive"
    ) {
      return NextResponse.json(
        { error: "User is not active." },
        { status: 403 }
      );
    }

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
