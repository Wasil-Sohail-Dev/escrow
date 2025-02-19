import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Upload, Eye } from "lucide-react";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import { useMilestoneTask } from '@/contexts/MilestoneTaskContext';
import DragDropFile from "@/components/shared/DragDropFile";

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  mileStoneData: any;
  fetchContract: () => void;
}


const RevisionRequestModal = ({ isOpen, onClose, mileStoneData, fetchContract }: RevisionRequestModalProps) => {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const { handleMilestoneAction } = useMilestoneTask();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setDocuments([]);
    }
  }, [isOpen]);

  const handleRemoveFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for revision",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await handleMilestoneAction({
        contractId: mileStoneData.contractId,
        milestoneId: mileStoneData.milestoneId,
        action: "client_requested_changes",
        userId: user?._id || "",
        title: "Revision Request",
        description: description,
        userRole: user?.userType || "",
        files: documents,
        onSuccess: () => {
          fetchContract();
          setDescription("");
          setDocuments([]);
          onClose();
        }
      });
    } catch (error) {
      // Error is already handled by the context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={isOpen} onOpenChange={onClose}>
        <ModalContent className="w-[95%] max-w-[547px] px-4 md:px-6 rounded-lg">
          <ModalHeader>
            <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-4">
              Revision Request
            </ModalTitle>
          </ModalHeader>

          <div className="space-y-6 mt-5">
            <div>
              <p className="text-[14px] sm:text-[15px] md:text-[16px] font-[400] text-[#525252] dark:text-dark-text mb-4">
                Upload Files
              </p>
              <DragDropFile
                onFileSelect={(files: File[]) => {
                  setDocuments(prev => [...prev, ...files]);
                }}
                acceptedFileTypes="image/*,.pdf,.doc,.docx,.zip"
                // maxFiles={5}
                // maxSize={10}
              />

              {/* File Preview Button */}
              {documents.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={() => setIsFilePreviewOpen(true)}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    variant="ghost"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View selected files ({documents.length})
                  </Button>
                </div>
              )}
            </div>

            <div>
              <p className="text-[14px] sm:text-[15px] md:text-[16px] font-[400] text-[#525252] dark:text-dark-text mb-4">
                Reason For Revision<span className="text-red-500">*</span>
              </p>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your reason for revision"
                className="h-[100px] p-4 rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#CBCBCB] focus:border-[#CBCBCB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-paragraph/60 dark:placeholder:text-dark-text/40"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#E3E3E3] pt-4">
              <Button 
                onClick={onClose}
                disabled={submitting}
                className="bg-white hover:bg-white/90 text-paragraph border dark:bg-dark-input-bg dark:text-dark-text dark:border-dark-border text-[12px] sm:text-[13px] md:text-[16px] font-[400] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:text-dark-text text-[12px] sm:text-[13px] md:text-[16px] font-[400] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        files={documents}
        onRemove={handleRemoveFile}
        isDownloadable={false}
      />
    </>
  );
};

export default RevisionRequestModal; 