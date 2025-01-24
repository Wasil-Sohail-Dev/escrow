"use client";

import React, { useState, useEffect } from "react";
import { Share2, Upload } from "lucide-react";
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

interface FormData {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string;
  companyName?: string;
  companyAddress?: string;
}

const Settings = () => {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
    companyName: "",
    companyAddress: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

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
      });
    }
  }, [user]);

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
      const response = await axios.patch("/api/manage-profile", {
        customerId: user?._id,
        ...formData,
      });

      if (response.data) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default",
        });
      }
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
      formData.companyAddress === (user.companyAddress || "")
    );
  };

  return (
    <>
      <Topbar
        title="Settings"
        description="Add the following details in order to complete your profile"
      />
      {userLoading ? (<Loader size="lg" text="Loading profile..." />) : (
      <div className="flex flex-col gap-6 w-full mt-[85px]">
        {/* Profile Header */}
        <div>
          <h2 className="text-subtle-medium md:text-base-medium dark:text-dark-text">
            Your Profile Picture
          </h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
            {/* Profile Picture Upload */}
            <div className="relative border border-dashed dark:border-dark-border rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 w-[100px] h-[100px] md:w-[130px] md:h-[130px]">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <Image
                src={user?.profileImage || "/assets/profileplaceholder.svg"}
                alt="profile"
                width={130}
                height={130}
                className="dark:invert w-full h-full"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 justify-center">
              <h1 className="text-heading4-medium md:text-heading3-bold dark:text-dark-text">
                {user?.userName || ""}
              </h1>
              <p className="text-base-regular md:text-[20px] font-[400] leading-[19px] text-[#64748B] dark:text-dark-text/60">
                Fill up the details to complete your profile
              </p>
            </div>
            <button className="p-3 bg-[#E8EAEE80] dark:hover:bg-dark-border/20 transition-colors rounded-full">
              <Share2 className="w-5 h-5 md:w-6 md:h-6 text-gray-300 dark:text-dark-text/60" />
            </button>
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
                      errors.phone ? "border-red-500 focus:border-red-500 dark:focus:border-red-500" : ""
                    }`}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
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

            {/* Government ID Upload - Kept as requested */}
            <div className="col-span-1 lg:col-span-2 lg:w-[42%] w-full">
              <Label className="block text-base-medium dark:text-dark-text mb-2">
                Government ID Card
              </Label>
              <div className="border-2 border-dashed border-[#CACED8] dark:border-dark-border rounded-lg p-6 md:p-8 text-center cursor-pointer dark:bg-dark-input-bg">
                <input type="file" className="hidden" id="file-upload" />
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full sm:w-auto h-[42px] px-4 bg-[#E71D1D] hover:bg-[#E71D1D]/90 text-base1-semibold text-white rounded-lg transition-colors"
            >
              Delete Account
            </Button>
            {/* <Button
              disabled={saving}
              className="w-full sm:w-auto h-[42px] px-6 md:px-10 border bg-transparent border-primary text-base1-semibold hover:text-primary hover:bg-transparent rounded-lg transition-colors dark:text-dark-text dark:bg-dark-input-bg"
            >
              Cancel
            </Button> */}
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
