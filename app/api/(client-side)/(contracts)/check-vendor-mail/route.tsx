import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const vendorEmail = searchParams.get("vendorEmail");

    // Check if vendorEmail is provided
    if (!vendorEmail) {
      return NextResponse.json(
        { error: "vendorEmail is required as a query parameter." },
        { status: 422 }
      );
    }

    // Check if the vendor exists in the database
    const vendor = await Customer.findOne({
      email: vendorEmail,
      userType: "vendor",
    });

    if (!vendor) {
      return NextResponse.json(
        { error: `No vendor found with email: ${vendorEmail}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Vendor email is valid.",
        data: {
          vendorId: vendor._id,
          vendorEmail: vendor.email,
          vendorName: vendor.name, // Assuming the `Customer` model has a `name` field
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking vendor email:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
