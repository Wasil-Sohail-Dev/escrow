import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  };
}

const DocumentViewerModal = ({ isOpen, onClose, document: fileData }: DocumentViewerModalProps) => { 
  const isImage = fileData.fileType.toLowerCase().startsWith("image/");
  const isPDF = fileData.fileType.toLowerCase().includes("pdf");
  const isText = fileData.fileType.toLowerCase().includes("text") || 
                fileData.fileType.toLowerCase().includes("txt");

  const handleDownload = async () => {
    try {
      const response = await fetch(fileData.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[1000px] h-[90vh] px-4 md:px-6 rounded-lg">
        <ModalHeader className="flex justify-between items-center">
          <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text">
            {fileData.fileName}
          </ModalTitle>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2 text-paragraph dark:text-dark-text"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </ModalHeader>

        <div className="flex-1 overflow-hidden mt-4">
          {isImage && (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-dark-input-bg rounded-lg overflow-auto">
              <img
                src={fileData.fileUrl}
                alt={fileData.fileName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {isPDF && (
            <iframe
              src={`${fileData.fileUrl}#toolbar=0`}
              className="w-full h-[calc(90vh-120px)] rounded-lg"
            />
          )}

          {isText && (
            <iframe
              src={fileData.fileUrl}
              className="w-full h-[calc(90vh-120px)] bg-white dark:bg-dark-input-bg rounded-lg p-4"
            />
          )}

          {!isImage && !isPDF && !isText && (
            <div className="w-full h-[calc(90vh-120px)] flex items-center justify-center bg-gray-100 dark:bg-dark-input-bg rounded-lg">
              <p className="text-gray-500 dark:text-dark-text/60">
                Preview not available. Please download the file to view it.
              </p>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default DocumentViewerModal; 