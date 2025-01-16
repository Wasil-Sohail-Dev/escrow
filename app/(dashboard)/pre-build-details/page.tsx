"use client";

import React, { useState } from "react";
import Topbar from "../../../components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import EditContractModal from "@/components/modals/EditContractModal";
import EnterDetailsModal from "@/components/modals/EnterDetailsModal";

const PreBuildDetails = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <>
      <Topbar
        title="Pre-Build Details"
        description="Add the following details in order to create your contract"
      />
      <div className="mt-[85px]">
        <div className="flex mb-4 sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-[32px] sm:text-[40px] lg:text-[53.42px] font-[700] leading-[42px] sm:leading-[48px] lg:leading-[83.33px] text-[#292929] dark:text-dark-text">
            Home Renovation
          </h1>
          {/* Original Edit button and modal */}
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white dark:text-dark-text px-6 md:px-8 text-[14px] font-[700]"
          >
            Edit
          </Button>
        </div>
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] mb-4 text-[#292929] dark:text-dark-text/60">
          Prepared by [your name] for [Vendor name] | [date goes here]
        </p>

        {/* Project Scope */}
        <div className="mb-6 border-t border-[#D0D0D0] dark:border-dark-border pt-6">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Project Scope
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] text-[#292929] dark:text-dark-text/60">
            In this section you can give a brief introduction to the context of
            what you will be doing, as well as any goals the client has
            articulated to you. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Pellentesque non congue dui.
          </p>
        </div>

        {/* Milestones */}
        <div className="mb-10">
          <h2 className="text-[20px] sm:text-[22px] lg:text-[24.57px] font-[700] leading-[35px] sm:leading-[39px] lg:leading-[43.25px] mb-2 text-[#292929] dark:text-dark-text">
            Milestones
          </h2>
          <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-[400] leading-[28px] sm:leading-[32px] lg:leading-[35.2px] mb-4 text-[#292929] dark:text-dark-text/60">
            Payment terms here. Client can pay all upfront, 50% upfront, or
            incrementally (if it's a big project).
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
                <tr className="dark:bg-dark-bg">
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                    The deliverable should be described here
                  </td>
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                    $X,XXX.XX
                  </td>
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                    Add terms and descriptions as necessary here. Outline
                    specifically what you will do and what the client will
                    receive.
                  </td>
                </tr>
                <tr className="dark:bg-dark-bg">
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                    The deliverable should be described here
                  </td>
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                    $X,XXX.XX
                  </td>
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text/60">
                    Add terms and descriptions as necessary here. Outline
                    specifically what you will do and what the client will
                    receive.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#F8F8F8] dark:bg-dark-input-bg">
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 font-[600] text-[#292929] dark:text-dark-text">
                    Total
                  </td>
                  <td className="border border-[#919191] dark:border-dark-border p-2 sm:p-3 lg:p-4 text-[#292929] dark:text-dark-text">
                    $X,XXX.XX
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
            Here you should describe the process and timing of the project.
            Touch on meetings, when key project milestones will happen and what
            the client should expect from you.
          </p>
          <div className="relative mt-8 md:max-w-3xl w-full overflow-x-auto pb-4">
            <div className="min-w-[600px]">
              {/* Timeline line */}
              <div className="absolute h-[2px] bg-[#D0D0D0] dark:bg-dark-border md:w-[85%] w-full top-[6px]"></div>

              {/* Timeline points */}
              <div className="flex justify-between relative">
                {/* Point 1 */}
                <div className="flex flex-col">
                  <div className="w-3 h-3 bg-[#292929] dark:bg-dark-text rounded-full mb-2"></div>
                  <span className="text-[14px] sm:text-[16px] text-[#292929] dark:text-dark-text text-center">
                    Design System
                  </span>
                  <span className="text-[12px] sm:text-[14px] text-[#A6A8AB] dark:text-dark-text/60 text-center">
                    March 2024
                  </span>
                </div>

                {/* Point 2 */}
                <div className="flex flex-col">
                  <div className="w-3 h-3 bg-[#292929] dark:bg-dark-text rounded-full mb-2"></div>
                  <span className="text-[14px] sm:text-[16px] text-[#292929] dark:text-dark-text text-center">
                    Design System
                  </span>
                  <span className="text-[12px] sm:text-[14px] text-[#A6A8AB] dark:text-dark-text/60 text-center">
                    March 2024
                  </span>
                </div>

                {/* Point 3 */}
                <div className="flex flex-col">
                  <div className="w-3 h-3 bg-[#292929] dark:bg-dark-text rounded-full mb-2"></div>
                  <span className="text-[14px] sm:text-[16px] text-[#292929] dark:text-dark-text text-center">
                    Design System
                  </span>
                  <span className="text-[12px] sm:text-[14px] text-[#A6A8AB] dark:text-dark-text/60 text-center">
                    March 2024
                  </span>
                </div>

                {/* Point 4 */}
                <div className="flex flex-col">
                  <div className="w-3 h-3 bg-[#292929] dark:bg-dark-text rounded-full mb-2"></div>
                  <span className="text-[14px] sm:text-[16px] text-[#292929] dark:text-dark-text text-center">
                    Design System
                  </span>
                  <span className="text-[12px] sm:text-[14px] text-[#A6A8AB] dark:text-dark-text/60 text-center">
                    March 2024
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
            The Client shall pay the Contractor as follows: 25% of the total
            project fee upon execution of this Agreement, which shall be
            refundable in the event of termination of this Agreement by the
            Client prior to the completion of the Work Product...
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
