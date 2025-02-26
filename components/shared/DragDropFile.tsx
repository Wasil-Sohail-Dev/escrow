import React, { useState } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";

interface DragDropFileProps {
  onFileSelect: (files: File[]) => void;
  acceptedFileTypes?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  icon?: string;
  text?: string;
  buttonText?: string;
  showRequirements?: boolean;
  disabled?: boolean;
}

const DragDropFile: React.FC<DragDropFileProps> = ({
  onFileSelect,
  acceptedFileTypes = "image/*,.pdf,.doc,.docx,.zip",
  maxFiles = 10,
  maxSize = 5, // 5MB default
  className = "",
  icon = "/assets/download2.svg",
  text = "Drag and drop files here or",
  buttonText = "browse files",
  showRequirements = true,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  // Format accepted file types for display
  const getFormattedFileTypes = () => {
    return acceptedFileTypes
      .split(',')
      .map(type => {
        if (type === "image/*") return "Images";
        if (type.startsWith('.')) return type.slice(1).toUpperCase();
        return type;
      })
      .join(', ');
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const invalidFiles: { name: string; reason: string }[] = [];

    files.forEach(file => {
      // Check file type
      const isValidType = acceptedFileTypes.split(',').some(type => {
        if (type.includes('/*')) {
          const mainType = type.split('/')[0];
          return file.type.startsWith(`${mainType}/`);
        }
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return type.includes(extension);
      });

      // Check file size
      const isValidSize = file.size <= maxSize * 1024 * 1024;

      if (!isValidType) {
        invalidFiles.push({
          name: file.name,
          reason: "Unsupported file format"
        });
      } else if (!isValidSize) {
        invalidFiles.push({
          name: file.name,
          reason: `Exceeds ${maxSize}MB limit`
        });
      } else {
        validFiles.push(file);
      }
    });

    // Show consolidated message for all upload results
    if (invalidFiles.length > 0 || validFiles.length > 0) {
      const totalFiles = files.length;
      const successCount = validFiles.length;
      const failureCount = invalidFiles.length;

      if (successCount === totalFiles) {
        // All files successful
        toast({
          title: "Files uploaded successfully",
          description: `${successCount} ${successCount === 1 ? 'file' : 'files'} ready for submission`,
        });
      } else if (failureCount === totalFiles) {
        // All files failed
        toast({
          title: "Unable to upload files",
          description: (
            <div className="space-y-1">
              <p>Please check the following requirements:</p>
              <ul className="text-sm list-disc pl-4">
                {invalidFiles.map((file, index) => (
                  <li key={index} className="text-destructive">
                    {file.name.length > 25 
                      ? file.name.substring(0, 25) + "..." 
                      : file.name}: {file.reason}
                  </li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive"
        });
      } else {
        // Partial success
        toast({
          title: "Some files couldn't be uploaded",
          description: (
            <div className="space-y-1">
              <p>{successCount} of {totalFiles} files uploaded successfully.</p>
              <p className="text-sm text-destructive">Failed uploads:</p>
              <ul className="text-sm list-disc pl-4">
                {invalidFiles.map((file, index) => (
                  <li key={index} className="text-destructive">
                    {file.name.length > 25 
                      ? file.name.substring(0, 25) + "..." 
                      : file.name}: {file.reason}
                  </li>
                ))}
              </ul>
            </div>
          ),
          variant: "warning"
        });
      }
    }

    return validFiles;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > maxFiles) {
      toast({
        title: "File limit exceeded",
        description: `You can upload up to ${maxFiles} files at once. Please reduce the selection.`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > maxFiles) {
        toast({
          title: "File limit exceeded",
          description: `You can upload up to ${maxFiles} files at once. Please reduce the selection.`,
          variant: "destructive"
        });
        return;
      }

      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed ${
          isDragging ? 'border-primary' : 'border-[#CACED8] dark:border-dark-border'
        } rounded-lg p-6 md:p-8 text-center cursor-pointer dark:bg-dark-input-bg hover:border-primary dark:hover:border-primary transition-colors ${className}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          disabled={disabled}
          type="file"
          className="hidden"
          id="file-upload"
          onChange={handleFileInput}
          multiple={maxFiles > 1}
          accept={acceptedFileTypes}
        />
        <label
          htmlFor="file-upload"
          className="w-full h-full cursor-pointer"
        >
          <div className="flex justify-center mb-2">
            {icon ? (
              <Image
                src={icon}
                alt="upload"
                width={40}
                height={30}
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/download2.svg';
                }}
              />
            ) : (
              <svg
                className="w-10 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>
          <p className="text-subtle-medium text-[#64748B] dark:text-dark-text/60">
            {text}{" "}
            <span className="text-primary text-[12px] font-[700] leading-[18px]">
              {buttonText}
            </span>
          </p>
          {showRequirements && (
            <div className="mt-2 text-xs text-[#64748B] dark:text-dark-text/60 space-y-0.5">
              <p>Accepted formats: {getFormattedFileTypes()}</p>
              <p>Maximum file size: {maxSize}MB</p>
              {maxFiles > 1 && <p>Upload up to {maxFiles} files at once</p>}
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default DragDropFile; 