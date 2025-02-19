"use client";

import React, { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Plus, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ContractSuccessModal from "@/components/modals/ContractSuccessModal";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import { useContractForm } from "@/hooks/use-contract-form";
import DragDropFile from "@/components/shared/DragDropFile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const CreateContract = () => {
  const router = useRouter();
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const {
    formData,
    isLoading,
    vendorEmailError,
    isVendorValid,
    paymentError,
    contractDateError,
    milestoneDateErrors,
    inviteContractId,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    handleInputChange,
    handleMilestoneChange,
    addNewMilestone,
    handleFileUpload,
    onSubmit,
    saveFormDataToSession,
    fieldErrors,
    handleBlur,
    milestoneErrors,
    handleRemoveFile,
    thirdPartyFee,
  } = useContractForm();

  const showPreview = () => {
    saveFormDataToSession();
    router.push("/pre-built-details");
  };

  const allMilestonesValid = formData.milestones.every(
    (milestone) =>
      milestone.name &&
      milestone.amount &&
      milestone.startDate &&
      milestone.endDate
  );

  return (
    <>
      <Topbar
        title="Create Your Contract"
        description="Add the following details in order to create your contract"
      />
      <div className="mt-[85px]">
        <div className="w-full">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-[22px] lg:text-[24px] font-bold mb-2 text-[#292929] dark:text-dark-text">
              Create Contract
            </h1>
            <Button
              onClick={() => router.push("/pre-built-contracts")}
              className="h-[38px] lg:h-[42px] bg-primary hover:bg-primary/90 text-white dark:text-dark-text"
            >
              Use Pre-Built Templates
            </Button>
          </div>

          <form className="space-y-6">
            {/* Contract Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-0 border-y border-[#D0D0D0] dark:border-dark-border py-8">
              <label className="text-[15px] lg:text-[22px] text-[#292929] dark:text-dark-text font-[500]">
                Contract Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-8 ml-10">
                {["services", "products"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`contract-${type}`}
                      checked={formData.contractType === type}
                      onCheckedChange={() =>
                        handleInputChange("contractType", type)
                      }
                      className="border-[#E8EAEE] rounded-full"
                    />
                    <label
                      htmlFor={`contract-${type}`}
                      className="text-[14px] text-[#292929] dark:text-dark-text capitalize"
                    >
                      {type}
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help dark:text-dark-text">
                            ⓘ
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {type === "services"
                            ? "For service-based contracts (3-4% fee)"
                            : "For product-based contracts (5-10% fee)"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Contract ID <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  disabled
                  value={formData.contractId}
                  onChange={(e) =>
                    handleInputChange("contractId", e.target.value)
                  }
                  placeholder="Enter contract ID"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Vendor Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    disabled={isLoading}
                    type="email"
                    value={formData.vendorEmail}
                    onChange={(e) =>
                      handleInputChange("vendorEmail", e.target.value)
                    }
                    onBlur={() => handleBlur("vendorEmail")}
                    placeholder="Enter vendor email"
                    className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                      vendorEmailError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : isVendorValid
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "border-[#D1D5DB] dark:border-dark-border"
                    } rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                  />
                  {isVendorValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="text-[#00BA88]" />
                    </div>
                  )}
                </div>
                {vendorEmailError && (
                  <p className="text-sm text-red-500 mt-1">
                    {vendorEmailError}
                  </p>
                )}
              </div>
            </div>

            {/* Contract Title */}
            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Contract Title <span className="text-red-500">*</span>
              </label>
              <Input
                disabled={isLoading}
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="eg. Graphic Design"
                className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                  fieldErrors.title
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-[#D1D5DB]"
                } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.title}</p>
              )}
            </div>

            {/* Contract Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2 flex flex-col">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={
                    formData.startDate
                      ? new Date(formData.startDate + "T00:00:00")
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      const formattedDate = date.toISOString().split("T")[0];
                      handleInputChange("startDate", formattedDate);
                    }
                  }}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select start date"
                  className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                    contractDateError ? "border-red-500" : "border-[#D1D5DB]"
                  } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                  minDate={new Date()}
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  End Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={
                    formData.endDate
                      ? new Date(formData.endDate + "T00:00:00")
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      const formattedDate = date.toISOString().split("T")[0];
                      handleInputChange("endDate", formattedDate);
                    }
                  }}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select end date"
                  className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                    contractDateError ? "border-red-500" : "border-[#D1D5DB]"
                  } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                  minDate={
                    formData.startDate
                      ? new Date(formData.startDate)
                      : new Date()
                  }
                />
              </div>
            </div>
            {contractDateError && (
              <div className="col-span-full">
                <p className="text-sm text-red-500 -mt-4">
                  {contractDateError}
                </p>
              </div>
            )}
            {/* Contract Description */}
            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Contract Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                onBlur={() => handleBlur("description")}
                placeholder="eg. It includes..."
                className={`min-h-[120px] dark:bg-dark-input-bg border ${
                  fieldErrors.description
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-[#E8EAEE]"
                } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
              />
              {fieldErrors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Payment Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-0 border-t border-[#D0D0D0] dark:border-dark-border pt-8">
              <label className="text-[15px] lg:text-[22px] text-[#292929] dark:text-dark-text font-[500]">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-8 ml-10">
                {["hourly", "fixed"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.paymentType === type}
                      onCheckedChange={() =>
                        handleInputChange("paymentType", type)
                      }
                      className="border-[#E8EAEE] rounded-full"
                    />
                    <label
                      htmlFor={type}
                      className="text-[14px] text-[#292929] dark:text-dark-text"
                    >
                      {type === "hourly" ? "Hourly" : "Fixed Price"}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Project Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2 flex-1">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Total Project Payment <span className="text-red-500">*</span>
                </label>
                <Input
                  disabled={isLoading}
                  type="number"
                  value={formData.totalPayment}
                  onChange={(e) =>
                    handleInputChange("totalPayment", e.target.value)
                  }
                  onBlur={() => handleBlur("totalPayment")}
                  placeholder="$2500"
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                    fieldErrors.totalPayment
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-[#D1D5DB]"
                  } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                />
                {fieldErrors.totalPayment && (
                  <p className="text-sm text-red-500 mt-1">
                    {fieldErrors.totalPayment}
                  </p>
                )}
                {paymentError && (
                  <p className="text-sm text-red-500 mt-1">{paymentError}</p>
                )}
              </div>

              {/* Third Party Fee Display */}
              {formData.totalPayment &&
                !isNaN(parseFloat(formData.totalPayment)) && (
                  <div className="space-y-2 flex-1">
                    <label className="text-[15px] md:text-body-medium text-primary font-semibold">
                      Third Party Fee ({thirdPartyFee.percentage}%)
                    </label>
                    <div className="h-[48px] lg:h-[52px] flex items-center px-4 bg-primary/10 dark:bg-dark-input-bg border border-primary dark:border-dark-border rounded-lg">
                      <span className="text-[16px] font-medium text-primary">
                        ${thirdPartyFee.fee}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-dark-text/60">
                      This fee will be deducted from the total payment
                    </p>
                  </div>
                )}
            </div>

            {/* Milestones Section */}
            <div>
              <div
                className="flex justify-between items-center mb-6 cursor-pointer"
                onClick={allMilestonesValid ? addNewMilestone : () => {}}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h2
                        className={`text-body-medium ${
                          allMilestonesValid ? "text-primary" : "text-gray-500"
                        } text-[15px] flex items-center`}
                      >
                        <Plus className="mr-2" /> Add New Milestone
                      </h2>
                    </TooltipTrigger>
                    <TooltipContent>
                      {allMilestonesValid
                        ? "Add Milestone"
                        : "Please fill all the milestone fields"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {formData.milestones.map((milestone, index) => (
                <div key={index} className="space-y-6">
                  <h2 className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold mt-5">
                    Milestone {index + 1}
                  </h2>

                  {/* Milestone Name and Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Milestone Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        disabled={isLoading}
                        type="text"
                        value={milestone.name}
                        onChange={(e) =>
                          handleMilestoneChange(index, "name", e.target.value)
                        }
                        onBlur={() => handleBlur(`milestone${index}.name`)}
                        placeholder="eg. Floor Planning"
                        className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          milestoneErrors[index]?.name
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                      />
                      {milestoneErrors[index]?.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {milestoneErrors[index].name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Milestone Amount <span className="text-red-500">*</span>
                      </label>
                      <Input
                        disabled={isLoading}
                        type="number"
                        value={milestone.amount}
                        onChange={(e) =>
                          handleMilestoneChange(index, "amount", e.target.value)
                        }
                        onBlur={() => handleBlur(`milestone${index}.amount`)}
                        placeholder="$500"
                        onWheel={(e) => e.currentTarget.blur()}
                        className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          milestoneErrors[index]?.amount
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                      />
                      {milestoneErrors[index]?.amount && (
                        <p className="text-sm text-red-500 mt-1">
                          {milestoneErrors[index].amount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Milestone Description */}
                  <div className="space-y-2">
                    <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                      Milestone Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) =>
                        handleMilestoneChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      onBlur={() => handleBlur(`milestone${index}.description`)}
                      placeholder="eg. The Graphic Design process..."
                      className={`min-h-[120px] dark:bg-dark-input-bg border ${
                        milestoneErrors[index]?.description
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-[#E8EAEE]"
                      } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                    />
                    {milestoneErrors[index]?.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {milestoneErrors[index].description}
                      </p>
                    )}
                  </div>

                  {/* Milestone Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
                    <div className="space-y-2 flex flex-col">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={
                          milestone.startDate
                            ? new Date(milestone.startDate + "T00:00:00")
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (date) {
                            const formattedDate = date
                              .toISOString()
                              .split("T")[0];
                            handleMilestoneChange(
                              index,
                              "startDate",
                              formattedDate
                            );
                          }
                        }}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="Select start date"
                        className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          milestoneDateErrors[index]
                            ? "border-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                        minDate={new Date(formData.startDate)}
                        maxDate={new Date(formData.endDate)}
                      />
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={
                          milestone.endDate
                            ? new Date(milestone.endDate + "T00:00:00")
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (date) {
                            const formattedDate = date
                              .toISOString()
                              .split("T")[0];
                            handleMilestoneChange(
                              index,
                              "endDate",
                              formattedDate
                            );
                          }
                        }}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="Select end date"
                        className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          milestoneDateErrors[index]
                            ? "border-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                        minDate={
                          milestone.startDate
                            ? new Date(milestone.startDate)
                            : new Date(formData.startDate)
                        }
                        maxDate={new Date(formData.endDate)}
                      />
                    </div>
                  </div>
                  {milestoneDateErrors[index] && (
                    <div className="col-span-full">
                      <p className="text-sm text-red-500 -mt-4">
                        {milestoneDateErrors[index]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Document Upload */}
            <div className="space-y-1">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Contract Documents Upload
              </label>
              <p className="text-[14px] text-gray-500 dark:text-dark-text/60">
                Upload vendor's contract documents, agreements, or any relevant
                paperwork (Optional)
              </p>
              <DragDropFile
                onFileSelect={(files: File[]) => {
                  handleFileUpload({ target: { files } } as any);
                }}
                acceptedFileTypes="image/*,.pdf,.doc,.docx,.zip"
                // maxFiles={5}
                // maxSize={10}
              />

              {/* File Preview Button */}
              {formData.documents && formData.documents.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsFilePreviewOpen(true);
                    }}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    variant="ghost"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View selected files ({formData.documents.length})
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
          <Button
            onClick={showPreview}
            className="w-full sm:w-auto h-[42px] px-6 md:px-10 border bg-transparent text-[#292929] border-primary hover:text-primary hover:bg-transparent rounded-lg transition-colors dark:text-dark-text dark:hover:text-primary dark:bg-dark-input-bg"
            disabled={
              !formData.title || !formData.description || !formData.totalPayment
            }
          >
            Preview
          </Button>
          <Button
            onClick={onSubmit}
            className="w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-[16px] font-[700] leading-[19.6px] text-white dark:text-dark-text rounded-lg transition-colors"
            disabled={
              isLoading ||
              !formData.title ||
              !formData.description ||
              !formData.totalPayment
            }
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      <ContractSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        contractId={inviteContractId}
      />

      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        files={formData.documents}
        onRemove={handleRemoveFile}
        isDownloadable={false}
      />
    </>
  );
};

export default CreateContract;
