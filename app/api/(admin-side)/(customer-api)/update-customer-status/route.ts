import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { customerId, isBlocked, adminId } = await req.json();

    if (!customerId || !adminId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Only allow transitions between active and adminInactive
    if (isBlocked && customer.userStatus !== "active") {
      return NextResponse.json(
        { success: false, error: "Can only block active customers" },
        { status: 400 }
      );
    }

    if (!isBlocked && customer.userStatus !== "adminInactive") {
      return NextResponse.json(
        { success: false, error: "Can only unblock inactive customers" },
        { status: 400 }
      );
    }

    // Update the status
    const newStatus = isBlocked ? "adminInactive" : "active";
    await customer.updateStatus(newStatus);

    return NextResponse.json({
      success: true,
      message: `Customer ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      customer
    });
  } catch (error: any) {
    console.error("Error updating customer status:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
} 