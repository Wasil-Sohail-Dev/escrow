"use client";
import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { signOut } from "next-auth/react";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutConfirmationModal = ({
  isOpen,
  onClose,
}: LogoutConfirmationModalProps) => {
  const handleLogout = () => {
    localStorage.removeItem("TpAuthToken");
    signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[400px] px-4 md:px-6 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-4">
            Confirm Logout
          </ModalTitle>
        </ModalHeader>
        <div className="space-y-4 mt-5">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mt-2">
              <LogOut className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-paragraph dark:text-dark-text">
              Are you sure you want to logout?
            </p>
            <p className="text-[12px] sm:text-[13px] md:text-[14px] text-paragraph/60 dark:text-dark-text/60">
              You will be returned to the login screen
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#E3E3E3] pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-[12px] sm:text-[13px] md:text-[14px] font-[600] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg dark:text-dark-text"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white dark:text-dark-text text-[12px] sm:text-[13px] md:text-[14px] font-[600] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
            >
              Logout
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default LogoutConfirmationModal;
