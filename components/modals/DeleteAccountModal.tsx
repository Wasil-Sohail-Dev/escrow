"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) => {
  const [password, setPassword] = useState("");

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[538px] px-4 sm:px-6 md:px-8 overflow-hidden">
        <ModalHeader className="text-center">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-[30px] md:h-[34px] text-[#364152]" />
          </div>
          <ModalTitle className="text-[24px] sm:text-[32px] leading-[32px] sm:leading-[40px] font-bold text-center dark:text-dark-text">
            Delete Account
          </ModalTitle>
          <ModalDescription className="text-center mt-4 sm:mt-6 md:mt-10 w-full sm:w-4/5 md:w-3/5 mx-auto">
            <div className="text-[14px] sm:text-[15px] md:text-[17px] font-bold leading-[16px] sm:leading-[17px] md:leading-[19px] mt-3 sm:mt-4 md:mt-5 text-[#F30505]">
              WARNING{" "}
              <span className="font-[400]">
                This is permanent and cannot be undone
              </span>
            </div>
          </ModalDescription>
        </ModalHeader>

        <div className="mt-6">
          <div className="text-[14px] sm:text-[15px] md:text-[17px] font-[400] leading-[16px] sm:leading-[17px] md:leading-[19px] text-center dark:text-dark-text mb-4 sm:mb-5 md:mb-6">
            Please make sure that you have saved any important data before
            proceeding. If you have any doubts, you can always cancel the
            deletion process.
          </div>
          <div className="space-y-2">
            <label className="block text-[14px] sm:text-[15px] md:text-[17px] font-medium leading-[16px] sm:leading-[17px] md:leading-[19px] dark:text-dark-text">
              Reason for Deletion
            </label>
            <Input
              placeholder="Reason"
              className="w-full h-[45px] sm:h-[52px] border border-[#B7B6B6] bg-[#FAFAFA] placeholder:text-[#B7B6B6] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text text-[14px] sm:text-[15px] md:text-[16px]"
            />
          </div>
          <div className="space-y-2 mt-4">
            <label className="block text-[14px] sm:text-[15px] md:text-[17px] font-medium leading-[16px] sm:leading-[17px] md:leading-[19px] dark:text-dark-text">
              Please enter your current password to proceed to{" "}
              <span className="hidden sm:inline">
                <br />
              </span>
              account deletion.
            </label>
            <Input
              type="password"
              placeholder="Enter your password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[45px] sm:h-[52px] border border-[#B7B6B6] bg-[#FAFAFA] placeholder:text-[#B7B6B6] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text text-[14px] sm:text-[15px] md:text-[16px]"
            />
          </div>
        </div>

        <div className="flex justify-center mt-4 sm:mt-5 md:mt-6 mb-2">
          <Button
            onClick={onConfirm}
            className="w-full h-[45px] sm:h-[52px] bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-lg font-[700] text-[16px] sm:text-[18px] md:text-[20px] leading-[19px] sm:leading-[21px] md:leading-[23.44px]"
          >
            Delete Account
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default DeleteAccountModal;
