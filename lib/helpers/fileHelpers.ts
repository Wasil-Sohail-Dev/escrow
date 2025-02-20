export interface FilePreviewType {
  name: string;
  type: string;
  url: string;
  size: number;
  preview?: string;
}

export interface S3File {
  fileUrl: string;
  fileName: string;
  fileType: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Convert S3 files to preview format
export const convertS3FilesToPreviewFiles = (files: S3File[]): FilePreviewType[] => {
  return files.map((file) => {
    // Extract original file name without the timestamp prefix
    const originalFileName = file.fileName.split('-').slice(1).join('-');
    
    // Determine file type and icon
    const fileType = file.fileType.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType);

    return {
      name: originalFileName,
      type: fileType,
      url: file.fileUrl,
      size: 0, // Size not available from URL
      preview: isImage ? file.fileUrl : `/assets/${fileType.toUpperCase()}.svg`,
    };
  });
};

// Convert contract files (URLs) to preview format
export const convertContractFilesToPreviewFiles = (files: S3File[]): FilePreviewType[] => {
  return files.map(file => ({
    name: file.fileName,
    type: file.fileType || file.fileName.split('.').pop() || 'unknown',
    url: file.fileUrl,
    size: 0 // Since we don't have the size from S3, we'll set it to 0
  }));
};

// Handle file download
export const handleFileDownload = async (file: FilePreviewType | S3File, toast: any) => {
  try {
    const url = 'url' in file ? file.url : file.fileUrl;
    const fileName = 'name' in file ? file.name : file.fileName;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    toast({
      title: "Error",
      description: "Failed to download file. Please try again.",
      variant: "destructive",
    });
  }
}; 