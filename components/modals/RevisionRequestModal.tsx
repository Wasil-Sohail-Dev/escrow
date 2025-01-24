import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Upload } from "lucide-react";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  mileStoneData: any;
}

const RevisionRequestModal = ({ isOpen, onClose, mileStoneData }: RevisionRequestModalProps) => {
  
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  // Reset description when modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription("");
    }
  }, [isOpen]);

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
      const response = await axios.post("/api/manage-milestone-tasks", {
        contractId: mileStoneData.contractId,
        milestoneId: mileStoneData.milestoneId,
        action: "client_requested_changes",
        userId: user?._id,
        title: "Revision Request",
        description: description,
        userRole: user?.userType
      });

      if (response.data) {
        toast({
          title: "Success",
          description: "Revision request submitted successfully",
          variant: "default",
        });
        setDescription(""); // Reset the form
        onClose(); // This will trigger the parent's handleRevisionModalClose
      }
    } catch (error) {
      console.error("Error submitting revision request:", error);
      toast({
        title: "Error",
        description: "Failed to submit revision request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[547px] px-4 md:px-6 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-4">
            Revision Request
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-6  mt-5">
          <div>
            <p className="text-[14px] sm:text-[15px] md:text-[16px] font-[400] text-[#525252] dark:text-dark-text mb-4">
              Upload Files
            </p>
            <div className="border-2 border-dashed border-[#E3E3E3] dark:border-dark-text rounded-lg md:h-[150px] h-[100px] flex items-center justify-center  p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2/10 transition-colors">
              <input type="file" className="hidden" id="file-upload" multiple />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Image src={"/assets/download.svg"} alt="upload" width={24} height={24} />
                  <p className="text-[12px] sm:text-[13px] md:text-[16px] font-[400] text-center text-paragraph dark:text-dark-text/60">
                    Click or drag file to this area to upload
                  </p>
                </div>
              </label>
            </div>
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
  );
};

export default RevisionRequestModal; 