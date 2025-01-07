"use client";

import React, { useState } from "react";
import { Share2, Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Topbar from "../components/Topbar";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";

// Styles
const inputStyles = `w-full h-[52px] px-4 bg-white dark:bg-dark-input-bg border border-[#CACED8] dark:border-dark-border rounded-lg
  text-base-regular dark:text-dark-text placeholder:text-[#64748B] dark:placeholder:text-dark-text/40
  focus:border-primary dark:focus:border-primary outline-none transition-all
  focus:shadow-[2px_2px_4px_0px_#26B8931A,-1px_-1px_4px_0px_#26B89333]`;

const selectStyles = `w-[90px] h-[52px] px-2 bg-white dark:bg-dark-input-bg border border-[#CACED8] dark:border-dark-border rounded-lg
  text-base-regular dark:text-dark-text focus:border-primary dark:focus:border-primary outline-none transition-all
  focus:shadow-[2px_2px_4px_0px_#26B8931A,-1px_-1px_4px_0px_#26B89333]`;

// Components
const ProfilePicture = () => (
  <div
    className="relative border border-dashed dark:border-dark-border rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80
    w-[100px] h-[100px] md:w-[130px] md:h-[130px]"
  >
    <input
      type="file"
      accept="image/*"
      className="absolute inset-0 opacity-0 cursor-pointer z-10"
    />
    <Image
      src="/assets/profileplaceholder.svg"
      alt="profile"
      width={130}
      height={130}
      className="dark:invert w-full h-full"
    />
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
      <Upload className="w-6 h-6 text-white" />
    </div>
  </div>
);

const ProfileHeader = () => (
  <>
    <h2 className="text-subtle-medium md:text-base-medium dark:text-dark-text -mb-4">
      Your Profile Picture
    </h2>
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
      <ProfilePicture />
      <div className="flex-1 flex flex-col gap-1 justify-center">
        <h1 className="text-heading4-medium md:text-heading3-bold dark:text-dark-text">
          Munazza Arshad
        </h1>
        <p className="text-base-regular md:text-[20px] font-[400] leading-[19px] text-[#64748B] dark:text-dark-text/60">
          Fill up the details to complete your profile
        </p>
      </div>
      <button className="p-3 bg-[#E8EAEE80] dark:hover:bg-dark-border/20 transition-colors rounded-full">
        <Share2 className="w-5 h-5 md:w-6 md:h-6 text-gray-300 dark:text-dark-text/60" />
      </button>
    </div>
  </>
);

const FormField = ({
  label,
  ...props
}: {
  label: string;
  [key: string]: any;
}) => (
  <div className="flex-1">
    <Label className="block text-base-medium dark:text-dark-text mb-2">
      {label}
    </Label>
    <Input className={inputStyles} {...props} />
  </div>
);

const PhoneNumberField = () => (
  <div>
    <Label className="block text-base-medium dark:text-dark-text mb-2">
      Phone Number
    </Label>
    <div className="flex gap-2">
      <select className={selectStyles}>
        <option value="+1">+1</option>
        <option value="+44">+44</option>
        <option value="+91">+91</option>
        <option value="+92">+92</option>
      </select>
      <Input
        type="tel"
        pattern="[0-9]*"
        className={inputStyles}
        placeholder="Enter phone number"
      />
    </div>
  </div>
);

const GovernmentIDUpload = () => (
  <div className="col-span-1 lg:col-span-2 lg:w-[42%] w-full">
    <Label className="block text-base-medium dark:text-dark-text mb-2">
      Government ID Card
    </Label>
    <div className="border-2 border-dashed border-[#CACED8] dark:border-dark-border rounded-lg p-6 md:p-8 text-center cursor-pointer dark:bg-dark-input-bg">
      <input type="file" className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="w-full h-full cursor-pointer">
        <div className="flex justify-center mb-2">
          <Image src={"/assets/download2.svg"} alt="upload" width={40} height={30} />
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
);

const ActionButtons = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteAccount = () => {
    // Handle account deletion logic here
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
        <Button
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-full sm:w-auto h-[42px] px-4 bg-[#E71D1D] hover:bg-[#E71D1D]/90 text-base1-semibold text-white rounded-lg transition-colors"
        >
          Delete Account
        </Button>
        <Button className="w-full sm:w-auto h-[42px] px-6 md:px-10 border bg-transparent border-primary text-base1-semibold hover:text-primary hover:bg-transparent rounded-lg transition-colors dark:text-dark-text dark:bg-dark-input-bg">
          Cancel
        </Button>
        <Button className="w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-base1-semibold text-white rounded-lg transition-colors">
          Save
        </Button>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
};

const Settings = () => {
  return (
    <>
      <Topbar
        title="Settings"
        description="Add the following details in order to complete your profile"
      />
      <div className="flex flex-col gap-6 w-full mt-[85px]">
        <ProfileHeader />

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6 md:mb-10">
            <h2 className="text-[18px] md:text-[20px] font-[600] leading-[24px] dark:text-dark-text">
              Edit Profile
            </h2>
            <span className="text-[16px]">✏️</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-x-[225px] md:gap-x-[100px]">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full lg:w-[60%]">
                  <FormField
                    label="First Name"
                    type="text"
                    placeholder="Munazza"
                  />
                </div>
                <div className="w-full lg:w-[40%]">
                  <FormField
                    label="Last Name"
                    type="text"
                    placeholder="Arshad"
                  />
                </div>
              </div>
              <FormField
                label="Business Name (Optional)"
                type="text"
                placeholder="Enter Business Name"
              />
              <FormField
                label="Bank Name"
                type="text"
                placeholder="Enter Bank Name"
              />
              <FormField
                label="Routing Number"
                type="text"
                placeholder="Add Routing number"
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <PhoneNumberField />
              <FormField
                label="Full Address"
                type="text"
                placeholder="Enter Email"
              />
              <FormField
                label="Bank Account Number"
                type="text"
                placeholder="Enter account number"
              />
            </div>

            <GovernmentIDUpload />
          </div>

          <ActionButtons />
        </div>
      </div>
    </>
  );
};

export default Settings;
