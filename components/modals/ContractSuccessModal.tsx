'use client'
import React from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ContractSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
}

const ContractSuccessModal = ({ isOpen, onClose, contractId }: ContractSuccessModalProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${contractId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link copied!",
      description: "Contract invite link has been copied to clipboard",
      variant: "default",
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[547px] px-4 md:px-6 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-4">
            Contract Created Successfully!
          </ModalTitle>
        </ModalHeader>
        <div className="space-y-4 mt-5">
          <p className="text-[14px] sm:text-[15px] md:text-[16px] text-paragraph dark:text-dark-text/60">
            Your contract has been created successfully. You can now:
          </p>

          <div className="bg-[#F9FAFB] dark:bg-dark-input-bg p-4 rounded-lg border border-[#E5E7EB] dark:border-dark-border">
            <p className="text-[12px] sm:text-[13px] md:text-[14px] text-paragraph dark:text-dark-text/60 mb-2">
              Share this link with your vendor:
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-dark-2 p-2 rounded border border-[#E5E7EB] dark:border-dark-border">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 text-[12px] sm:text-[13px] md:text-[14px] bg-transparent border-none focus:outline-none dark:text-dark-text"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="hover:bg-[#F3F4F6] dark:hover:bg-dark-2/50"
              >
                <Copy className="w-4 h-4 dark:text-dark-icon" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-paragraph dark:text-dark-text/60">
              We've also sent an email with the invite link to the vendor.
            </p>
          </div>

          <div className="flex items-end justify-end gap-3 mt-6 border-t border-[#E3E3E3] pt-6">
            <Button
              onClick={() => router.push(`/invite/${contractId}`)}
              className="bg-primary hover:bg-primary/90 text-white dark:text-dark-text text-[12px] sm:text-[13px] md:text-[14px] font-[600] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
            >
              Go to Invite Page <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ContractSuccessModal; 