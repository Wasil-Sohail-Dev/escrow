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
import { useRouter } from "next/navigation";
import { Contract } from "@/contexts/ContractContext";
import { Eye, Search } from "lucide-react";
import DragDropFile from "@/components/shared/DragDropFile";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import Loader from "@/components/ui/loader";

const CreateDispute = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
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
  });

  const [documents, setDocuments] = useState<File[]>([]);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);

  const [errors, setErrors] = useState({
    contractId: "",
    milestoneId: "",
    title: "",
    reason: "",
  });

  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );

  const fetchContracts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/get-customer-contracts?customerId=${user?._id}&role=${user?.userType}&page=${pageNum}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`
      );
      const { data, pagination } = await response.json();
      
      if (append) {
        setContracts(prev => [...prev, ...data]);
      } else {
        setContracts(data);
      }
      
      setHasMore(pagination.page < pagination.totalPages);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contracts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Reset pagination when search term changes
      setPage(1);
      fetchContracts(1, false);
    }
  }, [user, searchTerm]);

  const handleSelectScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      !loading && 
      hasMore && 
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20
    ) {
      setPage(prev => prev + 1);
      fetchContracts(page + 1, true);
    }
  };

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
      // Create FormData instance
      const submitFormData = new FormData();

      // Add JSON data
      const jsonData = {
        raisedByEmail: user?.email,
        raisedToEmail: formData.raisedToEmail,
        contractId: formData.contractId,
        milestoneId: formData.milestoneId,
        title: formData.title,
        reason: formData.reason,
      };
      submitFormData.append('data', JSON.stringify(jsonData));

      // Add files if they exist
      if (documents.length > 0) {
        documents.forEach((file) => {
          submitFormData.append('files', file);
        });
      }

      const response = await fetch("/api/create-disputed", {
        method: "POST",
        body: submitFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to create dispute");
      }

      const result = await response.json();

      if (result.success) {
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
        });
        setDocuments([]);
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

        // Redirect to appropriate page
        router.push(`/dispute-management-screen?contractId=${formData.contractId}`);
      }
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

  const handleFileUpload = (files: File[]) => {
    setDocuments(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
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
                  Select Contract <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={handleContractSelect}
                  value={formData.contractId}
                  onOpenChange={() =>
                    !touchedFields.contractId && handleBlur("contractId")
                  }
                >
                  <SelectTrigger
                    className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${"border-[#D1D5DB]"} dark:border-dark-border rounded-lg dark:text-dark-text`}
                  >
                    <SelectValue placeholder="Select a contract" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-hidden">
                    <div className="sticky top-0 bg-white dark:bg-dark-bg z-10 px-2 py-2 border-b dark:border-dark-border">
                      <div className="flex items-center gap-2 border dark:border-dark-border rounded-lg bg-[#FBFBFB] dark:bg-dark-input-bg px-3 focus-within:border-primary dark:focus-within:border-primary transition-colors">
                        <Search className="text-[#959BA4] dark:text-dark-text" style={{ height: '16px', width: '16px' }} />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search by contract title or ID..."
                          className="h-[36px] border-none bg-transparent dark:text-dark-text text-[14px] placeholder:text-[#959BA4] dark:placeholder:text-dark-text/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                    <div 
                      className="overflow-y-auto max-h-[200px]"
                      onScroll={handleSelectScroll}
                    >
                      {contracts.map((contract) => (
                        <SelectItem
                          key={contract.contractId}
                          value={contract.contractId}
                          className="cursor-pointer"
                        >
                          {contract.title} ({contract.contractId})
                        </SelectItem>
                      ))}
                      {loading && (
                        <div className="py-1 text-center">
                          <Loader size="sm" text="Loading more..." fullHeight={false} />
                        </div>
                      )}
                      {!hasMore && contracts.length > 0 && (
                        <div className="py-1 text-center text-gray-500 text-xs">
                          No more contracts
                        </div>
                      )}
                      {!loading && contracts.length === 0 && (
                        <div className="py-2 text-center text-gray-500">
                          No contracts found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Select Milestone <span className="text-red-500">*</span>
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
                    className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${"border-[#D1D5DB]"} dark:border-dark-border rounded-lg dark:text-dark-text`}
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
                Dispute Title <span className="text-red-500">*</span>
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
                Reason for Dispute <span className="text-red-500">*</span>
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
              <p className="text-[14px] text-gray-500 dark:text-dark-text/60">
                Upload any relevant documents to support your dispute
              </p>
              <DragDropFile
                onFileSelect={handleFileUpload}
                acceptedFileTypes="image/*,.pdf,.doc,.docx,.zip"
                // maxFiles={5}
                // maxSize={10}
              />

              {/* File Preview Button */}
              {documents.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={() => setIsFilePreviewOpen(true)}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    variant="ghost"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View selected files ({documents.length})
                  </Button>
                </div>
              )}
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

      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        files={documents}
        onRemove={handleRemoveFile}
        isDownloadable={false}
      />
    </>
  );
};

export default CreateDispute;
