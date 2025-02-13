import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadFileToS3(file: File, folder = "uploads") {
    if (!file) throw new Error("No file provided.");

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const fileKey = `${folder}/${fileName}`;

    try {
        // Generate pre-signed URL
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            ContentType: file.type,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

        // Upload file using fetch
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload file.");

        // Return public URL
        return {
            fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
            fileName,
        };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("File upload failed.");
    }
}
