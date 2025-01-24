import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";

export async function PATCH(req: Request) {
  try {
    const { customerId, ...updateFields } = await req.json();

    // Validate input
    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required." },
        { status: 422 }
      );
    }

    // List of fields that can be updated
    const allowedUpdates = [
      "firstName",
      "lastName",
      "userName",
      "email",
      "phone",
      "profileImage",
      "companyName",
      "companyAddress",
    ];

    // Filter updateFields to include only allowed fields
    const sanitizedUpdates: Record<string, any> = {};
    Object.keys(updateFields).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        sanitizedUpdates[key] = updateFields[key];
      }
    });

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 422 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find the user by ID
    const user = await Customer.findById(customerId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Update the user's profile
    Object.assign(user, sanitizedUpdates);
    await user.save();

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          companyName: user.companyName,
          companyAddress: user.companyAddress,
          userStatus: user.userStatus,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
