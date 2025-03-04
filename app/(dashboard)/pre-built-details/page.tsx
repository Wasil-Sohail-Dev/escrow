"use client";

import React, { useState, useEffect } from "react";
import Topbar from "../../../components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import EditContractModal from "@/components/modals/EditContractModal";
import EnterDetailsModal from "@/components/modals/EnterDetailsModal";
import { useRouter } from "next/navigation";

interface Milestone {
  name: string;
  amount: string;
  description: string;
  startDate: string;
  endDate: string;
}

const PreBuildDetails = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const savedFormData = sessionStorage.getItem('contractFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing form data:', error);
        router.push('/create-contract');
      }
    } else {
      router.push('/create-contract');
    }
  }, [router]);

  const handleBack = () => {
    // Store the current form data before going back
    if (formData) {
      sessionStorage.setItem('contractFormData', JSON.stringify(formData));
    }
    if (formData?.isSelected) {
      router.push('/pre-built-contracts');
    } else {
      router.push('/create-contract');
    }
  };

  const showPreview = () => {
    if (formData?.isSelected) {
      // If using a pre-built template, prepare template data
      const templateData = {
        ...formData,
        contractId: "", // This will be generated on create contract
        vendorEmail: "", // Reset vendor email
        startDate: "", // Reset dates
        endDate: "", // Reset dates
        documents: [], // Initialize empty documents array
        isSelected: false, // Set isSelected to false when going to create contract
        milestones: formData.milestones.map((milestone: Milestone) => ({
          ...milestone,
          startDate: "", // Reset milestone dates
          endDate: "" // Reset milestone dates
        }))
      };
      sessionStorage.setItem('contractFormData', JSON.stringify(templateData));
      router.push('/create-contract');
    } else {
      // If in create contract flow, just save current state
      sessionStorage.setItem('contractFormData', JSON.stringify(formData));
      router.push('/pre-built-details');
    }
  };

  return (
    <>
      <Topbar
        title={formData?.title || "Pre-built Details"}
        description="Add the following details in order to create your contract"
      />
      <div className="mt-[85px]">
        <div className="flex mb-4 sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex flex-col gap-4 items-start">
            <h1 className="text-[32px] sm:text-[40px] lg:text-[53.42px] font-[700] leading-[42px] sm:leading-[48px] lg:leading-[83.33px] text-[#292929] dark:text-dark-text">
              {formData?.title || 'Loading...'}
            </h1>
          </div>
          {/* Original Edit button and modal */}
          {false && <Button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white dark:text-dark-text px-6 md:px-8 text-[14px] font-[700]"
          >
            Edit
          </Button>}
        </div>
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] mb-4 text-[#292929] dark:text-dark-text/60">
          Contract ID: {formData?.contractId || 'Loading...'}
        </p>

        {/* Project Scope */}
        <div className="mb-6 border-t border-[#D0D0D0] dark:border-dark-border pt-6">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Project Scope
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] text-[#292929] dark:text-dark-text/60">
            {formData?.description || 'Loading...'}
          </p>
        </div>

        {/* Milestones */}
        <div className="mb-10">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Milestones
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] mb-4 text-[#292929] dark:text-dark-text/60">
            Total Payment: ${formData?.totalPayment || '0'} ({formData?.paymentType || 'fixed'})
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#919191] dark:border-dark-border text-[14px] sm:text-[16px] lg:text-[18px] text-left">
              <thead>
                <tr className="bg-[#F8F8F8] dark:bg-dark-input-bg">
                  <th className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 font-[500] text-[#292929] dark:text-dark-text">
                    Deliverable
                  </th>
                  <th className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 font-[500] text-[#292929] dark:text-dark-text">
                    Cost
                  </th>
                  <th className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 font-[500] text-[#292929] dark:text-dark-text">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData?.milestones?.map((milestone: any, index: number) => (
                  <tr key={index} className="dark:bg-dark-bg">
                    <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                      {milestone.name}
                    </td>
                    <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                      ${milestone.amount}
                    </td>
                    <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                      {milestone.description}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F8F8F8] dark:bg-dark-input-bg">
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 font-[600] text-[#292929] dark:text-dark-text">
                    Total
                  </td>
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text">
                    ${formData?.totalPayment || '0'}
                  </td>
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Process Timeline */}
        <div className="mb-6 border-t border-[#D0D0D0] dark:border-dark-border pt-6">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Process & Timeline
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] mb-4 text-[#292929] dark:text-dark-text/60">
            Project Duration: {formData ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}` : 'Loading...'}
          </p>
          <div className=" mt-8 md:max-w-4xl w-full overflow-x-auto pb-4">
            <div className="min-w-[600px] relative">
              {/* Timeline line */}
              <div className="absolute h-[2px] bg-[#D0D0D0] dark:bg-dark-border w-full top-[6px]"></div>

              {/* Timeline points */}
              <div className="flex justify-between relative">
                {/* Project Start */}
                <div className="flex flex-col">
                  <div className="w-3 h-3 bg-[#292929] dark:bg-dark-text rounded-full mb-2"></div>
                  <span className="text-[14px] sm:text-[16px] text-[#292929] dark:text-dark-text text-center">
                    Project Start
                  </span>
                  <span className="text-[12px] sm:text-[14px] text-[#A6A8AB] dark:text-dark-text/60 text-center">
                    {formData ? new Date(formData.startDate).toLocaleDateString() : 'Loading...'}
                  </span>
                </div>

                {/* Milestones */}
                {formData?.milestones?.map((milestone: any, index: number) => (
                  <div key={index} className="flex flex-col">
                    <div className="w-3 h-3 bg-[#292929] dark:bg-dark-text rounded-full mb-2"></div>
                    <span className="text-[14px] sm:text-[16px] text-[#292929] dark:text-dark-text text-center">
                      {milestone.name}
                    </span>
                    <span className="text-[12px] sm:text-[14px] text-[#A6A8AB] dark:text-dark-text/60 text-center">
                      {new Date(milestone.startDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}

                

                {/* Project End */}
                <div className="flex flex-col">
                  <div className="w-3 h-3 bg-[#292929] dark:bg-dark-text rounded-full mb-2"></div>
                  <span className="text-[14px] sm:text-[16px] text-[#292929] dark:text-dark-text text-center">
                    Project End
                  </span>
                  <span className="text-[12px] sm:text-[14px] text-[#A6A8AB] dark:text-dark-text/60 text-center">
                    {formData ? new Date(formData.endDate).toLocaleDateString() : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-6">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Payment Terms
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] text-[#292929] dark:text-dark-text/60">
            {formData ? (
              <>
                This contract follows a {formData.paymentType} payment structure with a total budget of ${formData.totalPayment}.
                {formData.milestones.length > 0 && ` The payment will be distributed across ${formData.milestones.length} milestone(s).`}
              </>
            ) : (
              'Loading...'
            )}
          </p>
        </div>

        {/* Industry Standards */}
        <div className="mb-6 border-t border-[#D0D0D0] dark:border-dark-border pt-6">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Industry Standards
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] text-[#292929] dark:text-dark-text/60">
            Neither party shall be liable for any failure or delay in
            performance under this Agreement to the extent such failure or delay
            is caused by events beyond the reasonable control of such party...
          </p>
        </div>

        {/* Vendor Information */}
        <div className="mb-6 border-t border-[#D0D0D0] dark:border-dark-border pt-6">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Vendor Information
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] text-[#292929] dark:text-dark-text/60">
            Vendor Email: {formData?.vendorEmail || 'Loading...'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="w-full sm:w-auto h-[42px] px-6 md:px-10 border-primary text-primary hover:bg-primary/10"
          >
            Back
          </Button>
          {formData?.isSelected && <Button
            onClick={showPreview}
            className="w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-white dark:text-dark-text"
          >
            Use Template
          </Button>}
        </div>
      </div>
      <EditContractModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <EnterDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </>
  );
};

export default PreBuildDetails;