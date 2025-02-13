"use client";
import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const fileName = encodeURIComponent(file.name.replace(/\s+/g, "-"));
    const fileType = file.type;

    try {
      // Step 1: Get the pre-signed URL
      const response = await fetch("/api/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType }),
      });

      const data = await response.json();

      console.log(data);
      //   if (!response.ok) {
      //     throw new Error(data.error || "Failed to get upload URL");
      //   }

      // Step 2: Upload the file to S3 using the signed URL
      try {
        const uploadResponse = await fetch(data.url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": fileType,
          },
        });

        console.log("uploadResponse", uploadResponse);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`S3 Upload Failed: ${errorText}`);
        }

        setUploadedUrl(data.url.split("?")[0]);
      } catch (error: any) {
        console.error("Upload error:", error);
        alert(`Upload failed: ${error.message}`);
      }

      // Step 3: Get the accessible file URL
      const fileUrl = data.url.split("?")[0]; // Removing query parameters

      setUploadedUrl(fileUrl);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Upload a File</h2>
      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2 w-full rounded"
      />
      <button
        onClick={uploadFile}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 mt-3 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {uploadedUrl && (
        <div className="mt-4">
          <p>File Uploaded:</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  );
}
