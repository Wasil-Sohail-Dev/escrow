import React from 'react';
import Image from 'next/image';
import { X, FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  files: Array<File | { name: string; type: string; url: string; size: number; preview?: string }>;
  onRemove?: (index: number) => void;
  className?: string;
  isDownloadable?: boolean;
  onDownload?: (file: any) => void;
  closeModal: () => void;
}


const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemove,
  className = '',
  isDownloadable = true,
  onDownload,
  closeModal
}) => {
  // Function to get file size in readable format
  const getFileSize = (file: File | { size: number }) => {

    const size = file.size;
    if (size < 1024) return size + ' B';
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    else return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Function to check if file is an image
  const isImageFile = (file: File | { type: string }) => {
    return file.type.startsWith('image/');
  };

  // Function to get file icon based on type
  const getFileIcon = (file: File | { type: string; preview?: string; url?: string }) => {
    if ('preview' in file && file.preview) return file.preview;
    if (isImageFile(file)) {
      return 'url' in file ? file.url : URL.createObjectURL(file as File);
    }
    return '/assets/PDF.svg';
  };

  // Function to get file type display text
  const getFileType = (file: File | { type: string }): string => {
    if (isImageFile(file)) return 'Image';
    if (file.type === 'application/pdf') return 'PDF';
    return file.type.split('/')[1]?.toUpperCase() || 'File';
  };

  // Function to handle file preview
  const handlePreviewFile = (file: File | { url: string; name: string }) => {
    if ('url' in file) {
      window.open(file.url, '_blank');
    } else {
      const url = URL.createObjectURL(file as File);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    }
  };

  // Function to handle file download
  const handleDownloadFile = async (file: File | { url: string; name: string }) => {
    try {
      if ('url' in file) {
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
      } else {
        const url = URL.createObjectURL(file as File);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {files.map((file, index) => (
        <div
          key={index}
          className="w-full flex items-center gap-3 p-4 hover:bg-gray-100/50 dark:hover:bg-dark-2/10 transition-colors cursor-pointer"
        >
          <div className="flex-shrink-0">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-2/20">
              {isImageFile(file) ? (
                <Image
                  src={getFileIcon(file) || ''}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                                  <div className='font-bold text-4xl bg-white dark:bg-transparent'>📄</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-text/60">
                {getFileType(file)}{file.size > 0 && ` • ${getFileSize(file)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePreviewFile(file)}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-dark-text/60 dark:hover:text-dark-text"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isDownloadable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload ? onDownload(file) : handleDownloadFile(file)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-dark-text/60 dark:hover:text-dark-text"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if ((files.length-1)===index) {
                    closeModal()
                  }
                  onRemove(index)
                }}
                className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-dark-text/60 dark:hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilePreview; 