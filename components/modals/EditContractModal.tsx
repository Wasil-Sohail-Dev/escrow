"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditContractModal = ({ isOpen, onClose }: EditContractModalProps) => {
  const [formData, setFormData] = useState({
    clientName: "",
    vendorName: "",
    startDate: "",
    projectTotalCost: "",
    projectScope: "",
    milestoneName: "",
    milestoneCost: "",
    milestoneDescription: "",
    milestoneDeadline: "",
    paymentTerms: "",
    industryStandards: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[1178.43px] px-3 sm:px-4 md:px-6 rounded-lg max-h-[90vh] overflow-y-auto">
        <ModalHeader className="sticky top-0 bg-white dark:bg-dark-bg z-10">
          <ModalTitle className="text-[16px] sm:text-[18px] md:text-[24px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] dark:border-dark-border pb-3 sm:pb-4">
            Edit Contract
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4 sm:space-y-5 mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
                Client Name
              </label>
              <Input
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Enter client name"
                className="h-[42px] sm:h-[46px] md:h-[47px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
            <div>
              <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
                Vendor Name
              </label>
              <Input
                value={formData.vendorName}
                onChange={(e) => handleInputChange('vendorName', e.target.value)}
                placeholder="Enter vendor name"
                className="h-[42px] sm:h-[46px] md:h-[47px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
                Start Date
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="h-[42px] sm:h-[46px] md:h-[47px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
            <div>
              <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
                Project Total Cost
              </label>
              <Input
                value={formData.projectTotalCost}
                onChange={(e) => handleInputChange('projectTotalCost', e.target.value)}
                placeholder="Enter total cost"
                className="h-[42px] sm:h-[46px] md:h-[47px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
              Project Scope
            </label>
            <Textarea
              value={formData.projectScope}
              onChange={(e) => handleInputChange('projectScope', e.target.value)}
              placeholder="eg. It includes..."
              className="min-h-[100px] p-3 sm:p-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#D0D0D0] dark:border-dark-border pt-6">
            <div>
              <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
                Milestone Name
              </label>
              <Input
                value={formData.milestoneName}
                onChange={(e) => handleInputChange('milestoneName', e.target.value)}
                placeholder="eg. Floor Planning"
                className="h-[42px] sm:h-[46px] md:h-[47px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
            <div>
              <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
                Milestone Cost
              </label>
              <Input
                value={formData.milestoneCost}
                onChange={(e) => handleInputChange('milestoneCost', e.target.value)}
                placeholder="$500"
                className="h-[42px] sm:h-[46px] md:h-[47px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
              Milestone Description
            </label>
            <Textarea
              value={formData.milestoneDescription}
              onChange={(e) => handleInputChange('milestoneDescription', e.target.value)}
              placeholder="eg. The Graphic Design process..."
              className="min-h-[100px] p-3 sm:p-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
              Milestone Deadline
            </label>
            <Input
              type="date"
              value={formData.milestoneDeadline}
              onChange={(e) => handleInputChange('milestoneDeadline', e.target.value)}
              className="h-[42px] sm:h-[46px] md:h-[47px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
            />
          </div>
            <div className="md:block hidden">
              
            </div>
          </div>


          <div className="border-t border-[#D0D0D0] dark:border-dark-border pt-6">
            <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
              Payment Terms
            </label>
            <Textarea
              value={formData.paymentTerms}
              onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              placeholder="Enter payment terms..."
              className="min-h-[100px] p-3 sm:p-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
            />
          </div>

          <div>
            <label className="text-[13px] sm:text-[14px] md:text-[20px] font-[500] dark:text-dark-text mb-1.5 block">
              Industry Standards
            </label>
            <Textarea
              value={formData.industryStandards}
              onChange={(e) => handleInputChange('industryStandards', e.target.value)}
              placeholder="Enter industry standards..."
              className="min-h-[100px] p-3 sm:p-4 rounded-[6px] sm:rounded-[8px] text-[12px] sm:text-[13px] md:text-[14px] border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
            />
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Button 
              onClick={onClose}
              variant="outline"
              className="bg-white hover:bg-white/90 hover:border-primary/90 text-paragraph border border-primary dark:bg-dark-input-bg dark:hover:bg-dark-input-bg/90 dark:text-dark-text dark:border-dark-border dark:hover:border-dark-border/90 text-[16px] font-[600] leading-[19.6px] h-[42px] sm:h-[38px] md:h-[42px] px-3 sm:px-4 rounded-[6px] sm:rounded-lg transition-all duration-200"
            >
              Preview
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:hover:bg-primary/90 dark:text-dark-text dark:hover:text-dark-text/90 text-[16px] font-[600] leading-[19.6px] h-[42px] sm:h-[38px] md:h-[42px] px-3 sm:px-4 rounded-[6px] sm:rounded-lg transition-all duration-200"
            >
              Save
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default EditContractModal; 