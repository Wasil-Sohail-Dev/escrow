import { getServerSession } from "next-auth"; // Assuming you're using next-aut
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: Request) {
  // Establish a connection to the database
  await dbConnect();
  console.log("Database connected.");

  try {
    // Declare the res variable
    const res = new NextResponse();

    // Get session data (e.g., email)
    const session = await getServerSession({ req, res, ...authOptions });
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { error: "User is not authenticated." },
        { status: 401 }
      );
    }

    // Check if the email parameter is provided
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Fetch the user data from the Customer collection
    const userData = await Customer.findOne({ email }).select(
      "-password -onboardingToken -tokenExpiresAt" // Exclude sensitive fields
    );

    // Handle cases where the user is not found
    if (!userData) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if the user's status is inactive
    if (
      userData.userStatus === "adminInactive" ||
      userData.userStatus === "userInactive"
    ) {
      return NextResponse.json(
        { error: "User is not active." },
        { status: 403 }
      );
    }

    // Send the filtered user data to the frontend
    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
