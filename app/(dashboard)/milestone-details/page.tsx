"use client";

import React, { useState } from "react";
import { Search, Clock3, Flag, CreditCard } from "lucide-react";

// Components
import Topbar from "../../../components/dashboard/Topbar";
import { Input } from "@/components/ui/input";
import Pagination from "../../../components/dashboard/Pagination";

// Utils & Types
import { cn } from "@/lib/utils";
import FilterButton from "../../../components/ui/filter-button";
import { milestoneData } from "@/lib/data/transactions";
import { CircularProgressbar } from "react-circular-progressbar";
import { useTheme } from "next-themes";

// Constants
const FILTER_OPTIONS = {
  dateRange: [
    "Last 7 days",
    "Last 30 days",
    "Last 3 months",
    "Last 6 months",
    "Last year",
  ],
  status: [
    { label: "Pending", color: "#FFB800" },
    { label: "Cancelled", color: "#FF0000" },
    { label: "Delivered", color: "#00BA88" },
  ],
  paymentMethod: ["Credit Card", "Bank Transfer", "PayPal"],
  project: ["All Projects", "Active Projects", "Completed Projects"],
};

const STATUS_STYLES = {
  completed: {
    bg: "bg-[#ECFDF3]",
    text: "text-[#027A48]",
    dot: "bg-[#12B76A]",
  },
  "in-delay": {
    bg: "bg-[#FFF8E5]",
    text: "text-[#B54708]",
    dot: "bg-[#F79009]",
  },
  "at-risk": {
    bg: "bg-[#FEF3F2]",
    text: "text-[#B42318]",
    dot: "bg-[#F04438]",
  },
} as const;

const TableHeader= () => {
  const checkboxStyle = cn(
    "h-4 w-4 rounded-[4px] ml-1 cursor-pointer appearance-none",
    "border border-[#D0D5DD] dark:border-dark-border",
    "bg-white dark:bg-dark-input-bg",
    "checked:bg-primary checked:border-primary",
    "checked:bg-[url('/assets/check.svg')] checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat",
    "hover:border-primary focus:border-primary",
    "focus:ring-1 focus:ring-primary focus:ring-offset-0",
    "dark:checked:bg-primary dark:checked:border-primary",
    "transition-all duration-200"
  );

  return (
    <thead>
      <tr>
        <th className="h-[72px] text-left bg-[#F9FAFB] dark:bg-dark-input-bg border-y border-[#EAECF0] dark:border-dark-border first:border-l first:rounded-l-lg first:border-[#EAECF0] px-6 text-[14px] text-[#374151] dark:text-dark-text font-[700]">
          <div className="flex items-center gap-8">
            <input
              type="checkbox"
              className={checkboxStyle}
            />
            MILESTONE NAME
          </div>
        </th>
        {["STATUS", "AMOUNT", "PROGRESS", "DEADLINE"].map((header, index) => (
          <th
            key={index}
            className="h-[72px] text-left bg-[#F9FAFB] dark:bg-dark-input-bg border-y border-[#EAECF0] dark:border-dark-border px-6 text-[14px] text-[#374151] dark:text-dark-text font-[700]"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const MileStoneDetails = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useTheme();
  const itemsPerPage = 5;
  const totalItems = milestoneData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = milestoneData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const checkboxStyle = cn(
    "h-4 w-4 rounded-[4px] ml-1 cursor-pointer appearance-none",
    "border border-[#D0D5DD] dark:border-dark-border",
    "bg-white dark:bg-dark-input-bg",
    "checked:bg-primary checked:border-primary",
    "checked:bg-[url('/assets/check.svg')] checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat",
    "hover:border-primary focus:border-primary",
    "focus:ring-1 focus:ring-primary focus:ring-offset-0",
    "dark:checked:bg-primary dark:checked:border-primary",
    "transition-all duration-200"
  );

  return (
    <>
      <Topbar
        title="Milestone Details"
        description="Detailed information about your work"
      />
      <div className="flex-1 mt-[85px]">
        <div className="px-4 md:px-10 lg:px-20">
          <div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:ml-20 md:mb-10">
              <div className="bg-[#FBFBFB] dark:bg-dark-input-bg w-full md:max-w-[324px] flex flex-col gap-2 p-4 rounded-md  dark:border-dark-border">
                <div className="grid grid-cols-2">
                  <p className="text-base-medium text-black dark:text-dark-text font-bold">Date added:</p>
                  <p className="text-base-regular text-[#4B5563] dark:text-dark-text">27/04/2021</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-base-medium text-black dark:text-dark-text font-bold">Deadline:</p>
                  <p className="text-base-regular text-[#4B5563] dark:text-dark-text">27/04/2021</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-base-medium text-black dark:text-dark-text font-bold">Assigned to:</p>
                  <p className="text-base-regular text-[#4B5563] dark:text-dark-text">Michael</p>
                </div>
              </div>
              <div className="bg-[#FBFBFB] dark:bg-dark-input-bg w-full max-w-[643px] flex flex-col gap-2 p-4 rounded-md  dark:border-dark-border">
                <p className="text-base-medium text-black dark:text-dark-text font-bold">Project Name: <span className="text-base-regular text-[#4B5563] dark:text-dark-text">Graphic Designing</span></p>
                <p className="text-base-medium text-black dark:text-dark-text font-bold">Project Description: <span className="text-base-regular text-[#4B5563] dark:text-dark-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.</span>
                </p>
                <p className="text-base-medium text-primary text-end underline hover:text-primary/80 cursor-pointer">See Details</p>
              </div>
            </div>
          </div>
          <div className="flex mt-10 flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            {/* <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <FilterButton
                icon={<Clock3 className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Date range"
                options={FILTER_OPTIONS.dateRange}
              />
              <FilterButton
                icon={<Flag className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Status"
                options={FILTER_OPTIONS.status}
              />
              <FilterButton
                icon={<CreditCard className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Payment Method"
                options={FILTER_OPTIONS.paymentMethod}
              />
              <FilterButton
                icon={<CreditCard className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Project"
                options={FILTER_OPTIONS.project}
              />
            </div> */}

            <div className="flex items-center gap-2 border dark:border-dark-border rounded-lg bg-[#FBFBFB] dark:bg-dark-input-bg w-full md:w-[411px] px-4 focus-within:border-primary dark:focus-within:border-primary transition-colors">
              <Search className="text-[#959BA4] dark:text-dark-text" style={{ height: '20px', width: '20px' }} />
              <Input
                placeholder="Search by amount , payment method..."
                className="w-full md:w-[300px] h-[38px] md:h-[42px] border-none bg-transparent dark:text-dark-text text-[12px] md:text-[14px] placeholder:text-[#959BA4] dark:placeholder:text-dark-text/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto mt-6">
            <table className="w-full border-separate border-spacing-0">
              <TableHeader />
              <tbody className="bg-[#F9FAFB] dark:bg-dark-input-bg">
                {currentItems.map((item, index) => (
                  <tr key={index} className="group">
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border first:border-l first:border-[#EAECF0] px-6 text-[14px] text-[#101828] dark:text-dark-text font-[500]">
                      <div className="flex items-center gap-8">
                        <input
                          type="checkbox"
                          className={checkboxStyle}
                        />
                        {item.name}
                      </div>
                    </td>
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[14px] font-[500]",
                          STATUS_STYLES[item.status].bg,
                          STATUS_STYLES[item.status].text
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_STYLES[item.status].dot)} />
                        {item.status.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6 text-[14px] text-[#101828] dark:text-dark-text font-[500]">
                      {item.amount}
                    </td>
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                      <div className="flex items-center ml-6">
                        <div style={{ width: 40, height: 40 }}>
                          <CircularProgressbar
                            value={item.progress}
                            text={`${item.progress}%`}
                            strokeWidth={12}
                            
                            styles={{
                              root: {},
                              path: {
                                stroke: item.status === "completed" ? '#12B76A' : 
                                       item.status === "in-delay" ? '#F79009' : 
                                       '#F04438',
                                strokeLinecap: 'round',
                                transition: 'stroke-dashoffset 0.5s ease 0s',
                                transform: 'rotate(0turn)',
                                transformOrigin: 'center center',
                              },
                              trail: {
                                stroke: '#E4E8EF',
                                strokeLinecap: 'round',
                              },
                              text: {
                                fill: theme === 'dark' ? '#fff' : '#101828',
                                fontSize: '24px',
                                dominantBaseline: 'middle',
                                textAnchor: 'middle',
                              },
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6 text-[14px] text-[#101828] dark:text-dark-text font-[500]">
                      {item.deadline}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      </div>
    </>
  );
};

export default MileStoneDetails;
