"use client";

import React from 'react';
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";

interface NewMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const NewMilestoneModal = ({ isOpen, onClose, onAccept, onDecline }: NewMilestoneModalProps) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[700px] px-4 sm:px-6 md:px-8 overflow-hidden bg-white dark:bg-dark-bg py-6 md:py-12">
        <ModalHeader className="text-center relative">
          <button 
            onClick={onClose}
            className="absolute md:right-4 right-6 md:top-0 top-4 text-[#8A8F9B] hover:text-paragraph dark:text-dark-2 dark:hover:text-dark-text"
          >
            <X className="md:w-8 md:h-8 w-6 h-6 text-primary" />
          </button>
          <div className="mx-auto w-16 h-16 sm:w-[140px] sm:h-[140px] bg-[#E6FBF6] rounded-[40px] flex items-center justify-center">
            <Image
              src="/assets/MaskGroup.svg"
              alt="milestone"
              width={140}
              height={140}
              className=" mt-5"
            />
          </div>
          <ModalTitle className="text-[24px] sm:text-[32px] leading-[32px] pt-4 sm:leading-[40px] font-bold text-center text-primary">
            New Milestone Added
          </ModalTitle>
          <ModalDescription className="text-center mt-4 sm:mt-6 md:mt-10">
            <p className="text-[14px] sm:text-[15px] md:text-[17px] font-[400] leading-[16px] sm:leading-[17px] md:leading-[19px] text-[#6F6C90] dark:text-white">
              A new milestone has been added by the client! Would you <br /> like to accept this milestone and proceed?
            </p>
            <div className="mt-4">
              <div
                onClick={() => window.location.href = '/milestone-details'}
                className="text-[14px] sm:text-[15px] md:text-[16px] font-[500] leading-[16px] sm:leading-[17px] md:leading-[19px] text-primary underline bg-transparent hover:bg-transparent"
              >
                View Details
              </div>
            </div>
          </ModalDescription>
        </ModalHeader>

        <div className="flex justify-center gap-4 mt-2 mb-4">
          <Button
            onClick={onDecline}
            className="w-[120px] sm:w-[140px] h-[45px] sm:h-[52px] bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-lg font-[700] text-[16px] sm:text-[18px] md:text-[20px] leading-[19px] sm:leading-[21px] md:leading-[23.44px]"
          >
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className="w-[120px] sm:w-[140px] h-[45px] sm:h-[52px] bg-primary hover:bg-primary/90 text-white rounded-lg font-[700] text-[16px] sm:text-[18px] md:text-[20px] leading-[19px] sm:leading-[21px] md:leading-[23.44px]"
          >
            Accept
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default NewMilestoneModal;