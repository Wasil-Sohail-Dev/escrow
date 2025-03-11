import { NextResponse } from "next/server";
import { Admin } from "@/models/AdminSchema";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(req: Request) {
  try {
    await dbConnect();

    const { id, status } = await req.json();

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Admin ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status value
    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find admin and ensure it's not a super_admin
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    if (admin.userType === "super_admin") {
      return NextResponse.json(
        { success: false, error: "Cannot modify super admin status" },
        { status: 403 }
      );
    }

    // Update admin status
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { userStatus: status },
      { new: true }
    ).select("-password");

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, error: "Failed to update admin status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin status updated successfully",
      data: updatedAdmin
    });

  } catch (error: any) {
    console.error("Error updating admin status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update admin status" },
      { status: 500 }
    );
  }
} 