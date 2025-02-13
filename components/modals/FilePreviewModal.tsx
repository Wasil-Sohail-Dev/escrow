import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import FilePreview from "@/components/shared/FilePreview";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files?: Array<File | { name: string; type: string; url: string; size: number; preview?: string }>;
  onRemove?: (index: number) => void;
  isDownloadable?: boolean;
  onDownload?: (file: any) => void;
}

const FilePreviewModal = ({
  isOpen,
  onClose,
  files = [],
  onRemove,
  isDownloadable = true,
}: FilePreviewModalProps) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[800px] px-4 md:px-6 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-4">
            Selected Files ({files?.length || 0})
          </ModalTitle>
        </ModalHeader>

        <div className="mt-5 mb-6 max-h-[500px] overflow-y-auto">
          <FilePreview
            files={files || []}
            onRemove={onRemove}
            closeModal={onClose}
            className="space-y-4"
            isDownloadable={isDownloadable}
          />
        </div>
      </ModalContent>
    </Modal>
  );
};

export default FilePreviewModal; 