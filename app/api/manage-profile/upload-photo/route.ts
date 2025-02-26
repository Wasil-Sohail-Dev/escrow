import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { uploadFileToS3 } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string;

    if (!file || !customerId) {
      return NextResponse.json(
        { error: "File and customerId are required." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Find the user
    const user = await Customer.findById(customerId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    try {
      // Upload to S3
      const { fileUrl } = await uploadFileToS3(file, 'profile-photos');

      // Update user's profile image in database
      user.profileImage = fileUrl;
      await user.save();

      return NextResponse.json({
        success: true,
        message: "Profile photo updated successfully.",
        profileImage: fileUrl
      });
    } catch (uploadError) {
      console.error("S3 upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error updating profile photo:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
} 