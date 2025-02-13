import React, { useState } from 'react';
import Image from 'next/image';

interface DragDropFileProps {
  onFileSelect: (files: File[]) => void;
  acceptedFileTypes?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  icon?: string;
  text?: string;
  buttonText?: string;
}

const DragDropFile: React.FC<DragDropFileProps> = ({
  onFileSelect,
  acceptedFileTypes = "image/*,.pdf,.doc,.docx",
  maxFiles = 10,
  maxSize = 10, // 10MB default
  className = "",
  icon = "/assets/download2.svg",
  text = "Drag and drop file here or",
  buttonText = "browse file"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
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

      return isValidType && isValidSize;
    });
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
    const validFiles = validateFiles(files).slice(0, maxFiles);

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files).slice(0, maxFiles);

      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed ${
        isDragging ? 'border-primary' : 'border-[#CACED8] dark:border-dark-border'
      } rounded-lg p-6 md:p-8 text-center cursor-pointer dark:bg-dark-input-bg hover:border-primary dark:hover:border-primary transition-colors ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
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
          <Image
            src={icon}
            alt="upload"
            width={40}
            height={30}
          />
        </div>
        <p className="text-subtle-medium text-[#64748B] dark:text-dark-text/60">
          {text}{" "}
          <span className="text-primary text-[12px] font-[700] leading-[18px]">
            {buttonText}
          </span>
        </p>
      </label>
    </div>
  );
};

export default DragDropFile; 