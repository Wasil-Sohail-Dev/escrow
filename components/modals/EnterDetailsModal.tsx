"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { X } from "lucide-react";

interface EnterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnterDetailsModal = ({ isOpen, onClose }: EnterDetailsModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[624px] px-6 rounded-[12px] max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-bg">
        <ModalHeader className="sticky top-0 bg-white dark:bg-dark-bg z-10 pt-6">
          <div className="flex justify-between items-start">
            <div>
              <ModalTitle className="text-[42px] font-[700] leading-[46px] text-[#292929] dark:text-dark-text">
                Enter Details
              </ModalTitle>
              <p className="text-[18px] font-[500] leading-[26px] text-[#292929]/60 dark:text-dark-text/60 mt-1">
                Enter the following details to assign it to vendor
              </p>
            </div>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-transparent"
              onClick={onClose}
            >
              <X className="h-6 w-6 text-[#292929] dark:text-dark-text" style={{height: '20px', width: '20px'}} />
            </Button>
          </div>
        </ModalHeader>

        <div className="space-y-10 mt-8 mb-10">
          <div>
            <input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Name"
              className="h-[62px] w-full text-base-regular border-b border-[#D1D5DB] dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
            />
          </div>
          <div>
            <input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Email"
              className="h-[62px] w-full text-base-regular border-b border-[#D1D5DB] dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
            />
          </div>
            <Button 
              className="space-y-2 bg-primary w-full hover:bg-primary/90 text-white text-[20px] font-[700] h-[62px] px-6 rounded-[6px] leading-[34px]"
            >
              Assign
            </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default EnterDetailsModal;