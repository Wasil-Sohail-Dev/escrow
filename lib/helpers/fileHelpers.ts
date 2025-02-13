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
export const convertContractFilesToPreviewFiles = (files: string[]): FilePreviewType[] => {
  return files.map((fileUrl) => {
    // Extract original file name from S3 URL
    const fileName = fileUrl.split('/').pop() || '';
    const decodedFileName = decodeURIComponent(fileName.split('-').slice(1).join('-'));
    
    // Determine file type and icon
    const fileType = decodedFileName.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType);

    return {
      name: decodedFileName,
      type: fileType,
      url: fileUrl,
      size: 0,
      preview: isImage ? fileUrl : `/assets/${fileType.toUpperCase()}.svg`,
    };
  });
};

// Handle file download
export const handleFileDownload = async (file: FilePreviewType, toast: any) => {
  try {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    toast({
      title: 'Error',
      description: 'Failed to download file. Please try again.',
      variant: 'destructive',
    });
  }
}; 