import { uploadFileToS3 } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const { fileUrl } = await uploadFileToS3(file);
    return NextResponse.json({
      message: "File uploaded successfully!",
      fileUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
