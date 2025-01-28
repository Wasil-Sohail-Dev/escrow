"use client";

import React, { useState, useEffect } from "react";
import Topbar from "../../../components/dashboard/Topbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface Contract {
  _id: string;
  contractId: string;
  title: string;
  vendorId: {
    email: string;
    userName: string;
  };
  clientId: {
    email: string;
    userName: string;
  };
  milestones: {
    title: string;
    milestoneId: string;
    _id: string;
  }[];
}

const CreateDispute = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [touchedFields, setTouchedFields] = useState({
    contractId: false,
    milestoneId: false,
    title: false,
    reason: false,
  });

  const [formData, setFormData] = useState({
    contractId: "",
    milestoneId: "",
    title: "",
    reason: "",
    raisedToEmail: "",
    documents: [],
  });

  const [errors, setErrors] = useState({
    contractId: "",
    milestoneId: "",
    title: "",
    reason: "",
  });

  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );

  const fetchContracts = async () => {
    try {
      const response = await fetch(
        `/api/get-customer-contracts?customerId=${user?._id}&role=${user?.userType}`
      );
      const { data } = await response.json();
      setContracts(data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contracts",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "title":
        if (!value) return "Title is required";
        if (value.length < 3) return "Title must be at least 3 characters long";
        if (value.length > 100) return "Title must be less than 100 characters";
        return "";
      case "reason":
        if (!value) return "Reason is required";
        if (value.length < 10)
          return "Reason must be at least 10 characters long";
        if (value.length > 500)
          return "Reason must be less than 500 characters";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (touchedFields[field as keyof typeof touchedFields]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(
        field,
        formData[field as keyof typeof formData] as string
      ),
    }));
  };

  const handleContractSelect = (contractId: string) => {
    const contract = contracts.find((c) => c.contractId === contractId);
    setSelectedContract(contract || null);

    if (contract) {
      const raisedToEmail =
        user?.userType === "client"
          ? contract.vendorId.email
          : contract.clientId.email;

      setFormData((prev) => ({
        ...prev,
        contractId,
        milestoneId: "",
        raisedToEmail,
      }));

      setErrors((prev) => ({
        ...prev,
        contractId: "",
      }));
    }

    handleBlur("contractId");
  };

  const handleSubmit = async () => {
    
    // Validate all fields
    const newErrors = {
      contractId: validateField("contractId", formData.contractId),
      milestoneId: validateField("milestoneId", formData.milestoneId),
      title: validateField("title", formData.title),
      reason: validateField("reason", formData.reason),
    };

    setErrors(newErrors);
    setTouchedFields({
      contractId: true,
      milestoneId: true,
      title: true,
      reason: true,
    });

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/create-disputed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raisedByEmail: user?.email,
          raisedToEmail: formData.raisedToEmail,
          contractId: formData.contractId,
          milestoneId: formData.milestoneId,
          title: formData.title,
          reason: formData.reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create dispute");
      }

      toast({
        title: "Success",
        description: "Dispute created successfully",
      });

      // Reset form
      setFormData({
        contractId: "",
        milestoneId: "",
        title: "",
        reason: "",
        raisedToEmail: "",
        documents: [],
      });
      setSelectedContract(null);
      setTouchedFields({
        contractId: false,
        milestoneId: false,
        title: false,
        reason: false,
      });
      setErrors({
        contractId: "",
        milestoneId: "",
        title: "",
        reason: "",
      });
    } catch (error) {
      console.error("Error creating dispute:", error);
      toast({
        title: "Error",
        description: "Failed to create dispute",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev: any) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
    }
  };

  return (
    <>
      <Topbar
        title="Create Dispute"
        description="Add the following details to create your dispute"
      />
      <div className="mt-[85px]">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-[22px] lg:text-[24px] font-bold mb-2 text-[#292929] dark:text-dark-text">
              Create Dispute
            </h1>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Select Contract
                </label>
                <Select
                  onValueChange={handleContractSelect}
                  value={formData.contractId}
                  onOpenChange={() =>
                    !touchedFields.contractId && handleBlur("contractId")
                  }
                >
                  <SelectTrigger
                    className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${"border-[#D1D5DB]"} dark:border-dark-border rounded-lg`}
                  >
                    <SelectValue placeholder="Select a contract" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem
                        key={contract.contractId}
                        value={contract.contractId}
                      >
                        {contract.title} ({contract.contractId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Select Milestone
                </label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("milestoneId", value)
                  }
                  value={formData.milestoneId}
                  disabled={!selectedContract}
                  onOpenChange={() =>
                    !touchedFields.milestoneId && handleBlur("milestoneId")
                  }
                >
                  <SelectTrigger
                    className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${"border-[#D1D5DB]"} dark:border-dark-border rounded-lg`}
                  >
                    <SelectValue placeholder="Select a milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedContract?.milestones.map((milestone) => (
                      <SelectItem
                        key={milestone.milestoneId}
                        value={milestone.milestoneId}
                      >
                        {milestone.title} ({milestone.milestoneId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Dispute Title
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="Enter dispute title"
                className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                  errors.title ? "border-red-500" : "border-[#D1D5DB]"
                } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
              />
              {touchedFields.title && errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Reason for Dispute
              </label>
              <Textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                onBlur={() => handleBlur("reason")}
                placeholder="Enter your reason for dispute..."
                className={`min-h-[120px] dark:bg-dark-input-bg border ${
                  errors.reason ? "border-red-500" : "border-[#E8EAEE]"
                } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
              />
              {touchedFields.reason && errors.reason && (
                <p className="text-sm text-red-500 mt-1">{errors.reason}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Upload Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-[#CACED8] dark:border-dark-border rounded-lg p-6 md:p-8 text-center cursor-pointer dark:bg-dark-input-bg hover:border-primary dark:hover:border-primary transition-colors">
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                  multiple
                />
                <label
                  htmlFor="file-upload"
                  className="w-full h-full cursor-pointer"
                >
                  <div className="flex justify-center mb-2">
                    <Image
                      src={"/assets/download2.svg"}
                      alt="upload"
                      width={40}
                      height={30}
                    />
                  </div>
                  <p className="text-subtle-medium text-[#64748B] dark:text-dark-text/60">
                    Drag and drop file here or{" "}
                    <span className="text-primary text-[12px] font-[700] leading-[18px]">
                      browse file
                    </span>
                  </p>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.contractId || !formData.milestoneId || !formData.title || !formData.reason}
            className="w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-[16px] font-[700] leading-[19.6px] text-white dark:text-dark-text rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit Dispute"
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CreateDispute;
