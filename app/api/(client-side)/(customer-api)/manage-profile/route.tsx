import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Customer } from "@/models/CustomerSchema";
import { uploadFileToS3 } from "@/lib/s3";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    
    const contentType = req.headers.get('content-type') || '';
    let customerId: string;
    let updateFields: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      customerId = formData.get('customerId') as string;
      
      // Extract all form fields
      for (const [key, value] of formData.entries()) {
        if (key !== 'file') {
          updateFields[key] = value;
        }
      }

      // Handle file upload if present
      const fileData = formData.get('file');
      let file: File | null = null;
console.log(fileData);

      if (fileData) {
        if (typeof fileData === 'string') {
          try {
            // Parse stringified file data
            const parsedFile = JSON.parse(fileData);
            // Convert the parsed data into a File object
            file = new File(
              [Buffer.from(parsedFile.uri || parsedFile.path || '', 'utf-8')],
              parsedFile.name,
              { type: parsedFile.type }
            );
          } catch (error) {
            console.error('Error parsing file data:', error);
            return NextResponse.json(
              { error: "Invalid file format received" },
              { status: 400 }
            );
          }
        } else {
          file = fileData as File;
        }

        if (file && file.name) {
          try {
            const { fileUrl } = await uploadFileToS3(file, 'profile-photos');
            updateFields.profileImage = fileUrl;
          } catch (error) {
            console.error('Error uploading file:', error);
            return NextResponse.json(
              { error: "Failed to upload profile photo." },
              { status: 500 }
            );
          }
        }
      }
    } else {
      const data = await req.json();
      customerId = data.customerId;
      updateFields = data;
    }

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

    // Find and update the user
    const user = await Customer.findById(customerId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Update the user's profile
    Object.assign(user, sanitizedUpdates);
    await user.save();

    return NextResponse.json(
      {
        success: true,
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
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
