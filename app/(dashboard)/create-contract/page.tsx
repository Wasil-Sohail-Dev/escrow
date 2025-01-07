"use client";

import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CreateContract = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    contractId: '',
    vendorEmail: '',
    contractTitle: '',
    startDate: '',
    endDate: '',
    description: '',
    paymentType: '',
    totalPayment: '',
    milestones: [{
      name: '',
      amount: '',
      description: '',
      startDate: '',
      endDate: ''
    }],
    documents: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('kitchen-design');

  const templates = [
    {id: 'kitchen-design', label: 'Kitchen Design'},
    {id: 'graphic-design', label: 'Graphic Design'}, 
    {id: 'home-renovation', label: 'Home Renovation'},
    {id: 'it-support', label: 'IT Support'},
    {id: 'website-development', label: 'Website Development'},
    {id: 'product-delivery', label: 'Product Delivery'}
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedMilestones = [...prev.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        [field]: value
      };
      return {
        ...prev,
        milestones: updatedMilestones
      };
    });
  };

  const addNewMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, {
        name: '',
        amount: '',
        description: '',
        startDate: '',
        endDate: ''
      }]
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
              Create Contract
            </h1>
            <Button 
              onClick={() => router.push('/pre-build-contracts')} 
              className="h-[38px] lg:h-[42px] bg-primary hover:bg-primary/90 text-white dark:text-dark-text"
            >
              Use Pre-build Templates
            </Button>
          </div>

          <div className='mb-8 flex md:justify-between flex-col md:flex-row items-center border-y border-[#D0D0D0] dark:border-dark-border py-8'>
            <h1 className="text-[22px] lg:text-[22px] font-[500] leading-[30px] mb-2 text-[#292929] dark:text-dark-text">
              Contract Template
            </h1>
            <div>
              <div className="flex flex-row sm:gap-10 gap-4">
                {templates.reduce((acc: JSX.Element[][], template, i) => {
                  if (i % 2 === 0) acc.push([]);
                  acc[acc.length - 1].push(
                    <div key={template.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={template.id}
                        checked={selectedTemplate === template.id}
                        onCheckedChange={() => setSelectedTemplate(template.id)}
                        className={`${
                          selectedTemplate === template.id 
                            ? "border-[#00BA88] data-[state=checked]:bg-[#00BA88] data-[state=checked]:border-[#00BA88]" 
                            : "border-[#E8EAEE]"
                        } rounded-full`}
                      />
                      <label
                        htmlFor={template.id}
                        className="text-[16px] font-[400] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#64748B] dark:text-dark-text/60"
                      >
                        {template.label}
                      </label>
                    </div>
                  );
                  return acc;
                }, []).map((column, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    {column}
                  </div>
                ))}
              </div>
            </div>
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
                  Vendor Email
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
                Contract Title
              </label>
              <Input 
                type="text"
                value={formData.contractTitle}
                onChange={(e) => handleInputChange('contractTitle', e.target.value)}
                placeholder="eg. Graphic Design"
                className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Start Date
                </label>
                <Input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  End Date
                </label>
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Contract Description
              </label>
              <Textarea 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="eg. It includes..."
                className="min-h-[120px] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-0 border-t border-[#D0D0D0] dark:border-dark-border pt-8">
              <label className="text-[15px] lg:text-[22px] text-[#292929] dark:text-dark-text font-[500]">
                Payment Terms
              </label>
              <div className="flex gap-8 ml-10">
                {['hourly', 'fixed'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={type}
                      checked={formData.paymentType === type}
                      onCheckedChange={() => handleInputChange('paymentType', type)}
                      className="border-[#E8EAEE] dark:border-dark-border rounded-full"
                    />
                    <label 
                      htmlFor={type} 
                      className="text-[14px] text-[#292929] dark:text-dark-text"
                    >
                      {type === 'hourly' ? 'Hourly' : 'Fixed Price'}
                    </label>
                  </div>
                ))}
              </div>
            </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20'>
            <div className="space-y-2 flex-1">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Total Project Payment
              </label>
              <Input 
                type="text"
                value={formData.totalPayment}
                onChange={(e) => handleInputChange('totalPayment', e.target.value)}
                placeholder="$2500"
                className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
            </div>
    <div className='md:block hidden flex-1'></div>
                </div>

            <div className="">
              <div 
                className="flex justify-between items-center mb-6 cursor-pointer"
                onClick={addNewMilestone}
              >
                <h2 className="text-body-medium text-primary text-[15px] flex items-center">
                  <Plus className='mr-2' /> Add New Milestone
                </h2>
              </div>

              {formData.milestones.map((milestone, index) => (
                <div key={index} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Milestone Name
                      </label>
                      <Input 
                        type="text"
                        value={milestone.name}
                        onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                        placeholder="eg. Floor Planning"
                        className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Milestone Amount
                      </label>
                      <Input 
                        type="text"
                        value={milestone.amount}
                        onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                        placeholder="$500"
                        className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                      Milestone Description
                    </label>
                    <Textarea 
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      placeholder="eg. The Graphic Design process..."
                      className="min-h-[120px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Start Date
                      </label>
                      <Input 
                        type="date"
                        value={milestone.startDate}
                        onChange={(e) => handleMilestoneChange(index, 'startDate', e.target.value)}
                        placeholder="MM/DD/YYYY"
                        className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        End Date
                      </label>
                      <Input 
                        type="date"
                        value={milestone.endDate}
                        onChange={(e) => handleMilestoneChange(index, 'endDate', e.target.value)}
                        placeholder="MM/DD/YYYY"
                        className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
          <Button className="w-full sm:w-auto h-[42px] px-6 md:px-10 border bg-transparent text-[#292929] border-primary hover:text-primary hover:bg-transparent rounded-lg transition-colors dark:text-dark-text dark:hover:text-primary dark:bg-dark-input-bg">
            Preview
          </Button>
          <Button className="w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-[16px] font-[700] leading-[19.6px] text-white dark:text-dark-text rounded-lg transition-colors">
            Save
          </Button>
        </div>
      </div>
    </>
  );
}

export default CreateContract;