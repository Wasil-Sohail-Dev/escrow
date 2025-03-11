"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CreatePromotionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    code: string;
    discountPercentage: string;
    reason: string;
    validFrom: string;
    validUntil: string;
    usageLimit: string;
  };
  formErrors: Record<string, string>;
  onSubmit: () => void;
  onChange: (field: string, value: string) => void;
}

const CreatePromotionCodeModal = ({
  isOpen,
  onClose,
  formData,
  formErrors,
  onSubmit,
  onChange,
}: CreatePromotionCodeModalProps) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[547px] px-4 md:px-6 rounded-lg">
        <div className="flex justify-between items-center">
          <ModalTitle className="text-[20px] sm:text-[24px] font-semibold dark:text-dark-text border-b border-[#E3E3E3] w-full dark:border-dark-border py-4">
            Create Promotion Code
          </ModalTitle>
        </div>
        <div className="space-y-4 mt-4">
          <div>
            <Input
              placeholder="Enter code (4-6 characters)"
              value={formData.code}
              onChange={(e) => onChange("code", e.target.value)}
              className={
                formErrors.code
                  ? "border-red-500 h-12 dark:text-dark-text"
                  : "h-12 dark:text-dark-text"
              }
            />
            {formErrors.code && (
              <p className="text-sm text-red-500 mt-1">{formErrors.code}</p>
            )}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Discount percentage"
              value={formData.discountPercentage}
              onChange={(e) => onChange("discountPercentage", e.target.value)}
              className={
                formErrors.discountPercentage
                  ? "border-red-500 h-12 dark:text-dark-text"
                  : "h-12 dark:text-dark-text"
              }
            />
            {formErrors.discountPercentage && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.discountPercentage}
              </p>
            )}
          </div>
          <div>
            <Input
              placeholder="Please write a short reason for the promotion code"
              value={formData.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              className={
                formErrors.reason
                  ? "border-red-500 h-12 dark:text-dark-text"
                  : "h-12 dark:text-dark-text"
              }
            />
            {formErrors.reason && (
              <p className="text-sm text-red-500 mt-1">{formErrors.reason}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker
                selected={
                  formData.validFrom
                    ? new Date(formData.validFrom + "T12:00:00")
                    : null
                }
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    onChange("validFrom", `${year}-${month}-${day}`);
                  } else {
                    onChange("validFrom", "");
                  }
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                  formErrors.validFrom ? "border-red-500" : "border-[#D1D5DB]"
                } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
              />
              {formErrors.validFrom && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.validFrom}
                </p>
              )}
            </div>
            <div>
              <DatePicker
                selected={
                  formData.validUntil
                    ? new Date(formData.validUntil + "T12:00:00")
                    : null
                }
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    onChange("validUntil", `${year}-${month}-${day}`);
                  } else {
                    onChange("validUntil", "");
                  }
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
                className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                  formErrors.validUntil ? "border-red-500" : "border-[#D1D5DB]"
                } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
              />
              {formErrors.validUntil && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.validUntil}
                </p>
              )}
            </div>
          </div>
          <div>
            <Input
              type="number"
              placeholder="Usage limit"
              value={formData.usageLimit}
              onChange={(e) => onChange("usageLimit", e.target.value)}
              className={
                formErrors.usageLimit
                  ? "border-red-500 h-12 dark:text-dark-text"
                  : "h-12 dark:text-dark-text"
              }
            />
            {formErrors.usageLimit && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.usageLimit}
              </p>
            )}
          </div>
          <Button className="w-full h-12" onClick={onSubmit}>
            Create Code
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default CreatePromotionCodeModal;
