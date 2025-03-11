"use client";

import React, { useState, useEffect } from "react";
import { Share2, Upload, Camera, ImagePlus, X, Eye, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Topbar from "../../../components/dashboard/Topbar";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Loader from "@/components/ui/loader";
import { FormField, inputStyles } from "@/components/ui/formField";
import DragDropFile from "@/components/shared/DragDropFile";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import BlockedAlert from "@/components/dashboard/BlockedAlert";

interface FormData {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string;
  companyName?: string;
  companyAddress?: string;
  profileImage?: string;
  tempProfileImage?: File;
}

interface KYCData {
  documents: Array<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    documentType: string;
    uploadedAt: string;
  }>;
  status: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface KYCFileWithMeta {
  file: File;
  documentType: string;
}

const DOCUMENT_TYPES = [
  { value: "government_id", label: "Government ID" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "other", label: "Other Document" },
] as const;

const getFileIcon = (fileType: string | undefined) => {
  if (!fileType) return "📄";
  return fileType.toLowerCase().startsWith("image/") ? "🖼️" : "📄";
};

const Settings = () => {
  const { user, loading: userLoading, refreshUser } = useUser();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKYC, setUploadingKYC] = useState(false);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [selectedKYCFiles, setSelectedKYCFiles] = useState<KYCFileWithMeta[]>(
    []
  );
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
    companyName: "",
    companyAddress: "",
    profileImage: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showAllDocs, setShowAllDocs] = useState(false);
  const DOCS_PER_PAGE = 2; // Number of documents to show initially

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        email: user.email || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
        companyAddress: user.companyAddress || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchKYCData = async () => {
      if (!user?._id) return;

      try {
        const response = await fetch(
          `/api/manage-profile/upload-kyc?customerId=${user._id}`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setKycData(data.data);
        }
      } catch (error) {
        console.error("Error fetching KYC data:", error);
      }
    };

    fetchKYCData();
  }, [user?._id]);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (user?.userType === "vendor") {
      if (!formData.companyName?.trim())
        newErrors.companyName = "Company name is required";
      if (!formData.companyAddress?.trim())
        newErrors.companyAddress = "Company address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or GIF image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Just update the local state with file preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        tempProfileImage: file,
        profileImage: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key !== "tempProfileImage" && key !== "profileImage" ) {
          formDataToSend.append(
            key,
            formData[key as keyof typeof formData] as string
          );
        }
      });

      // Append customerId
      formDataToSend.append("customerId", user?._id || "");

      // Append profile photo if it exists
      if (formData.tempProfileImage) {
        formDataToSend.append("file", formData.tempProfileImage);
      }

      const response = await fetch("/api/manage-profile", {
        method: "PATCH",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await refreshUser();

      // Clear temporary image
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData.tempProfileImage;
        return newData;
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormUnchanged = () => {
    if (!user) return true;

    return (
      formData.firstName === (user.firstName || "") &&
      formData.lastName === (user.lastName || "") &&
      formData.userName === (user.userName || "") &&
      formData.email === (user.email || "") &&
      formData.phone === (user.phone || "") &&
      formData.companyName === (user.companyName || "") &&
      formData.companyAddress === (user.companyAddress || "") &&
      formData.profileImage === (user.profileImage || "")
    );
  };

  const handleKYCFileSelect = (files: File[]) => {
    const kycFiles = files.map((file) => ({
      file,
      documentType: "",
    }));
    setSelectedKYCFiles(kycFiles);
  };

  const handleDocumentTypeChange = (index: number, type: string) => {
    setSelectedKYCFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index]) {
        newFiles[index] = {
          ...newFiles[index],
          documentType: type,
        };
      }
      return newFiles;
    });
  };

  const handleRemoveKYCFile = (index: number) => {
    setSelectedKYCFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKYCUpload = async () => {
    if (!selectedKYCFiles.length) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    // Check if all files have document types
    const missingTypes = selectedKYCFiles.some((file) => !file?.documentType);
    if (missingTypes) {
      toast({
        title: "Missing Document Types",
        description: "Please select document type for all files",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingKYC(true);
      const formData = new FormData();

      selectedKYCFiles.forEach((fileData) => {
        formData.append("files", fileData.file);
        formData.append("documentTypes", fileData.documentType);
      });

      formData.append("customerId", user?._id || "");

      const response = await fetch("/api/manage-profile/upload-kyc", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload KYC documents");
      }

      setKycData((prev) => ({
        ...prev!,
        documents: [...(prev?.documents || []), ...data.documents],
        status: data.status,
      }));

      setSelectedKYCFiles([]);
      toast({
        title: "Success",
        description: "KYC documents uploaded successfully",
      });
    } catch (error: any) {
      console.error("Error uploading KYC:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload KYC documents",
        variant: "destructive",
      });
    } finally {
      setUploadingKYC(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const displayedDocs = showAllDocs 
    ? kycData?.documents 
    : kycData?.documents?.slice(0, DOCS_PER_PAGE);

  return (
    <>
      <Topbar
        title="Settings"
        description="Add the following details in order to complete your profile"
      />
      {userLoading ? (
        <Loader size="lg" text="Loading profile..." />
      ) : (
        <div className="flex flex-col gap-6 w-full mt-[85px]">
          {/* Blocked Alert */}
          {user?.isButtonDisabled && (
            <BlockedAlert user={user} userLoading={userLoading} />
          )}

          {/* Profile Header */}
          <div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
              {/* Profile Picture Upload */}
              <div className="group relative border border-dashed dark:border-dark-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors w-[100px] h-[100px] md:w-[130px] md:h-[130px] overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  onChange={handlePhotoUpload}
                  // disabled={formData.profileImage !== ""}
                />
                  <>
                    <Image
                      src={
                        formData.profileImage ||
                        "/assets/profileplaceholder.svg"
                      }
                      alt="profile"
                      width={130}
                      height={130}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        formData.profileImage ? "group-hover:scale-105" : ""
                      }`}
                    />
                    {/* Hover Overlay */}
                    {!formData.profileImage && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <Camera className="w-6 h-6 text-white mb-2" />
                        <div className="flex flex-col items-center">
                          <span className="text-white text-xs font-medium">
                            {formData.profileImage
                              ? "Change Photo"
                              : "Upload Photo"}
                          </span>
                          <span className="text-white/80 text-[10px] mt-1">
                            JPG, PNG, GIF (Max 5MB)
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Upload Indicator */}
                    {!formData.profileImage && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/90 py-1 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1">
                        <ImagePlus className="w-3 h-3 text-white" />
                        <span className="text-[10px] text-white">Upload</span>
                      </div>
                    )}
                  </>
              </div>

              <div className="flex-1 flex flex-col gap-1 justify-center">
                <h1 className="text-heading4-medium md:text-heading3-bold dark:text-dark-text">
                  {user?.userName || ""}
                </h1>
                <p className="text-base-regular md:text-[20px] font-[400] leading-[19px] text-[#64748B] dark:text-dark-text/60">
                  Fill out details to complete your profile
                </p>
              </div>
              {/* <button className="p-3 bg-[#E8EAEE80] dark:hover:bg-dark-border/20 transition-colors rounded-full">
                <Share2 className="w-5 h-5 md:w-6 md:h-6 text-gray-300 dark:text-dark-text/60" />
              </button> */}
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6 md:mb-10">
              <h2 className="text-[18px] md:text-[20px] font-[600] leading-[24px] dark:text-dark-text">
                Edit Profile
              </h2>
              <span className="text-[16px]">✏️</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-x-[225px] md:gap-x-[100px]">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full lg:w-[60%]">
                    <FormField
                      label="First Name"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      error={errors.firstName}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="w-full lg:w-[40%]">
                    <FormField
                      label="Last Name"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      error={errors.lastName}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <FormField
                  label="Email"
                  type="email"
                  disabled={true}
                  required
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("email", e.target.value)
                  }
                  error={errors.email}
                  placeholder="Enter email"
                />
                {user?.userType === "vendor" && (
                  <>
                    <FormField
                      label="Business Name"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      error={errors.companyName}
                      placeholder="Enter business name"
                    />
                  </>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label className="block text-base-medium dark:text-dark-text mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div>
                    <Input
                      type="tel"
                      pattern="[0-9]*"
                      className={`${inputStyles} ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 dark:focus:border-red-500"
                          : ""
                      }`}
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm font-medium text-destructive mt-2 text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <FormField
                  label="Username"
                  type="text"
                  required
                  value={formData.userName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("userName", e.target.value)
                  }
                  error={errors.userName}
                  placeholder="Enter username"
                />
                {user?.userType === "vendor" && (
                  <FormField
                    label="Company Address"
                    type="text"
                    required
                    value={formData.companyAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("companyAddress", e.target.value)
                    }
                    error={errors.companyAddress}
                    placeholder="Enter company address"
                  />
                )}
              </div>

              {/* Government ID Upload */}
              <div className="col-span-1 lg:col-span-2 lg:w-[42%] w-full">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base-medium dark:text-dark-text">
                    Identity Verification Documents (KYC)
                  </Label>
                  {kycData && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        kycData.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                          : kycData.status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                      }`}
                    >
                      {kycData.status.charAt(0).toUpperCase() +
                        kycData.status.slice(1)}
                    </span>
                  )}
                </div>

                {kycData?.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-sm">
                    <p className="font-medium">Rejection Reason:</p>
                    <p>{kycData.rejectionReason}</p>
                  </div>
                )}

                <DragDropFile
                  onFileSelect={handleKYCFileSelect}
                  acceptedFileTypes=".pdf,.jpg,.jpeg,.png"
                  maxFiles={5}
                  maxSize={10}
                />

                {/* Selected Files Preview */}
                {selectedKYCFiles.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-dark-text/60">
                      Selected files ({selectedKYCFiles.length})
                    </p>

                    {/* Document Type Selection */}
                    <div className="space-y-3">
                      {selectedKYCFiles.map((fileData, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-input-bg rounded-lg"
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded">
                            {getFileIcon(fileData.file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-dark-text truncate">
                              {fileData.file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-dark-text/60">
                              {formatFileSize(fileData.file.size)}
                            </p>
                          </div>
                          <div className="relative min-w-[180px]">
                            <select
                              value={fileData.documentType}
                              onChange={(e) =>
                                handleDocumentTypeChange(index, e.target.value)
                              }
                              className={`w-full px-3 py-2 appearance-none bg-white dark:bg-dark-input-bg border ${
                                fileData.documentType
                                  ? "border-primary text-primary dark:text-primary"
                                  : "border-gray-200 text-gray-500 dark:text-dark-text/60"
                              } dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8 [&>option]:bg-white [&>option]:dark:bg-dark-bg [&>option]:dark:text-dark-text`}
                            >
                              <option
                                value=""
                                disabled
                                className="text-gray-500 dark:text-dark-text/60"
                              >
                                Select Type
                              </option>
                              {DOCUMENT_TYPES.map((type) => (
                                <option
                                  key={type.value}
                                  value={type.value}
                                  className="text-paragraph dark:text-dark-text bg-white dark:bg-dark-bg"
                                >
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveKYCFile(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleKYCUpload}
                      disabled={
                        uploadingKYC ||
                        selectedKYCFiles.some((file) => !file.documentType)
                      }
                      className="w-full"
                    >
                      {uploadingKYC ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </div>
                      ) : (
                        "Upload Documents"
                      )}
                    </Button>
                  </div>
                )}

                {/* Existing Documents */}
                {kycData?.documents && kycData.documents.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-dark-text">
                        Uploaded Documents
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-text/60">
                        {kycData.documents.length} document{kycData.documents.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {displayedDocs?.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-input-bg rounded-lg hover:bg-gray-100 dark:hover:bg-dark-input-bg/80 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded">
                              {doc.fileType.includes("pdf") ? "📄" : "🖼️"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-dark-text break-words break-all">
                                {doc.fileName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-dark-text/60">
                                Uploaded on{" "}
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.fileUrl, "_blank")}
                            className="hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4 text-gray-500 dark:text-dark-text/60" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Show More/Less Button */}
                    {kycData.documents.length > DOCS_PER_PAGE && (
                      <Button
                        variant="ghost"
                        className="w-full mt-2 text-primary hover:bg-primary/10"
                        onClick={() => setShowAllDocs(!showAllDocs)}
                      >
                        {showAllDocs ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Show {kycData.documents.length - DOCS_PER_PAGE} More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
              <div className="w-full sm:w-auto flex flex-col items-start">
                <p className="text-[#64748B] dark:text-dark-text/60 text-sm mb-1">
                  Do you want to delete your account?
                </p>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-[#E71D1D] hover:text-[#E71D1D]/90 text-sm font-medium transition-colors"
                >
                  Click here to delete your account
                </button>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={saving || isFormUnchanged()}
                className={`w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-base1-semibold text-white rounded-lg transition-colors ${
                  isFormUnchanged() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? (
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
        </div>
      )}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default Settings;
