import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { KYC } from "@/models/KycSchema";
import { uploadFileToS3 } from "@/lib/s3";
import { Admin } from "@/models/AdminSchema";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const customerId = formData.get("customerId") as string;

    if (!customerId) {
      return NextResponse.json(
        { error: "CustomerId is required." },
        { status: 400 }
      );
    }

    // Extract files and document types
    const rawFiles = formData.getAll("files");
    const documentTypes = formData.getAll("documentTypes") as string[];

    if (!rawFiles.length) {
      return NextResponse.json(
        { error: "Please select at least one file to upload." },
        { status: 400 }
      );
    }

    if (rawFiles.length !== documentTypes.length) {
      return NextResponse.json(
        { error: "Each file must have a corresponding document type." },
        { status: 400 }
      );
    }

    const validDocumentTypes = ["government_id", "passport", "drivers_license", "other"];
    const invalidTypes = documentTypes.filter(type => !validDocumentTypes.includes(type));

    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid document type(s): ${invalidTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Normalize files (Handling both Web and React Native format)
    const files = rawFiles.map((file: any) => {
      if (typeof file === "string") {
        try {
          const parsedFile = JSON.parse(file);
          if (!parsedFile.uri || !parsedFile.name) throw new Error("Invalid mobile file format");
          return {
            uri: parsedFile.uri,
            name: parsedFile.name || `file_${Date.now()}`,
            type: parsedFile.type || "application/octet-stream",
          };
        } catch (error) {
          console.error("Error parsing mobile file data:", error);
          throw new Error("Invalid file format received");
        }
      }

      if (file instanceof File) {
        return file; // Web file input is already valid
      }

      if (file.uri && file.name) {
        return file; // Handle React Native format
      }

      throw new Error("Invalid file format received");
    });

    // Connect to MongoDB
    await dbConnect();

    // Find existing KYC record or create a new one
    let kyc = await KYC.findOne({ customerId });
    if (!kyc) {
      kyc = new KYC({ customerId });
    }

    try {
      console.log(files, "files to be uploaded");

      // Upload files to S3 and add to documents array
      const uploadPromises = files.map(async (file, index) => {
        if (!file || !file.name) {
          throw new Error(`Invalid file at index ${index}`);
        }

        const { fileUrl, fileName } = await uploadFileToS3(
          file, "kyc-documents"
        );

        return {
          fileUrl,
          fileName,
          fileType: file.type || "application/octet-stream",
          documentType: documentTypes[index],
          uploadedAt: new Date(),
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);

      // Add new documents to KYC record
      kyc.documents.push(...uploadedDocs);

      // Reset status if it was rejected before
      if (kyc.status === "rejected") {
        kyc.status = "pending";
        kyc.rejectionReason = undefined;
      }

      await kyc.save();

      return NextResponse.json({
        success: true,
        message: "KYC documents uploaded successfully.",
        documents: uploadedDocs,
        status: kyc.status,
      });
    } catch (uploadError) {
      console.error("S3 upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload files to storage." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error uploading KYC documents:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "CustomerId is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find KYC record without population first
    let kyc = await KYC.findOne({ customerId });

    if (!kyc) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // If verifiedBy exists, populate admin details
    if (kyc.verifiedBy) {
      try {
        const admin = await Admin.findById(kyc.verifiedBy).select(
          "firstName lastName email"
        );
        if (admin) {
          kyc = kyc.toObject();
          kyc.verifiedBy = admin;
        }
      } catch (error) {
        console.error("Error populating admin:", error);
      }
    }

    return NextResponse.json({
      success: true,
      data: kyc,
    });
  } catch (error: any) {
    console.error("Error fetching KYC details:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
