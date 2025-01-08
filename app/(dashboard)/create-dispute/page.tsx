"use client";

import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';

const CreateDispute = () => {
  const [formData, setFormData] = useState({
    contractId: '',
    clientName: '',
    milestoneName: '',
    vendorEmail: '',
    title: '',
    date: '',
    complaint: '',
    documents: []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev: any ) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    }
  };

  return (
    <>
      <Topbar 
        title='Create Your Contract' 
        description='Add the following details in order to create your contract' 
      />
      <div className='mt-[85px]'>
        <div className='w-full'>
          <div className='mb-8 flex justify-between items-center'>
            <h1 className="text-[22px] lg:text-[24px] font-bold mb-2 text-[#292929] dark:text-dark-text">
              Create Dispute
            </h1>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Contract ID
                </label>
                <Input 
                  type="text"
                  value={formData.contractId}
                  onChange={(e) => handleInputChange('contractId', e.target.value)}
                  placeholder="Enter contract ID"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Client Name
                </label>
                <Input 
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Milestone Name
                </label>
                <Input 
                  type="text"
                  value={formData.milestoneName}
                  onChange={(e) => handleInputChange('milestoneName', e.target.value)}
                  placeholder="Enter milestone name"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Vendor Email Address
                </label>
                <Input 
                  type="email"
                  value={formData.vendorEmail}
                  onChange={(e) => handleInputChange('vendorEmail', e.target.value)}
                  placeholder="Enter vendor email"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Title
              </label>
              <Input 
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="eg. Graphic Design"
                className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Date
                </label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>

              <div className="space-y-2">
                
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Enter Your Complaint
              </label>
              <Textarea 
                value={formData.complaint}
                onChange={(e) => handleInputChange('complaint', e.target.value)}
                placeholder="eg. It involves..."
                className="min-h-[120px] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
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
          </form>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
          <Button className="w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-[16px] font-[700] leading-[19.6px] text-white dark:text-dark-text rounded-lg transition-colors">
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}

export default CreateDispute;
