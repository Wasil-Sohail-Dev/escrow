"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ChevronDown, Clock3, Flag, CreditCard, Ticket } from "lucide-react";

// Components
import Topbar from "../components/Topbar";
import HeadBar from "../components/HeadBar";
import PaymentOverview from "../components/PaymentOverview";
import { Input } from "@/components/ui/input";
import Pagination from "../components/Pagination";

// Utils & Types
import { cn } from "@/lib/utils";
import FilterButton from "../components/FilterButton";
import { transactions } from "@/lib/data/transactions";

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
  delivered: {
    bg: "bg-[#ECFDF3]",
    text: "text-primary",
    dot: "bg-primary",
  },
  pending: {
    bg: "bg-[#FFF8E5]",
    text: "text-[#B54708]",
    dot: "bg-[#F79009]",
  },
  cancelled: {
    bg: "bg-[#FEF3F2]",
    text: "text-[#B42318]",
    dot: "bg-[#F04438]",
  },
};


const TableHeader: React.FC<{
  selectAll: boolean;
  onSelectAll: () => void;
  checkboxStyle: string;
}> = ({ selectAll, onSelectAll, checkboxStyle }) => (
  <thead>
    <tr>
      <th className="h-[72px] text-left bg-[#F9FAFB] dark:bg-dark-input-bg border-y border-[#EAECF0] dark:border-dark-border first:border-l first:rounded-l-lg first:border-[#EAECF0] last:border-r last:rounded-r-lg last:border-[#EAECF0] px-6 text-[14px] text-[#374151] dark:text-dark-text font-[700]">
        <div className="flex items-center gap-8">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={onSelectAll}
            className={checkboxStyle}
          />
          PAYMENT ID
        </div>
      </th>
      {["STATUS", "AMOUNT", "P. METHOD", "CREATION DATE", ""].map((header, index) => (
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

const PaymentHistoryPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const itemsPerPage = 5;
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id];
      setSelectAll(newSelection.length === currentItems.length);
      return newSelection;
    });
  };

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
  )

  return (
    <>
      <Topbar
        title="Payment History"
        description="Here is a list of all your payments made done yet"
      />
      <div className="flex-1 mt-[85px]">
        <HeadBar title="Payment Overview" buttonName="Export" />
        <div className="px-4 md:px-10 lg:px-20">
          <PaymentOverview show={false} />

          <div className="flex mt-10 flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
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
            </div>

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
              <TableHeader
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                checkboxStyle={checkboxStyle}
              />
              <tbody className="bg-[#F9FAFB] dark:bg-dark-input-bg">
                {currentItems.map((item, index) => (
                  <tr key={index} className="group">
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border first:border-l first:border-[#EAECF0] px-6 text-[14px] text-[#101828] dark:text-dark-text font-[500]">
                      <div className="flex items-center gap-8">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                          className={checkboxStyle}
                        />
                        {item.id}
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
                        <span className={cn("w-1.5 h-1.5 rounded-md flex items-center justify-center", STATUS_STYLES[item.status].dot)}>
                          <Ticket className="w-1.5 h-1.5 text-white" />
                        </span>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6 text-[14px] text-[#101828] dark:text-dark-text font-[500]">
                      {item.amount}
                    </td>
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/assets/mastercard.svg"
                          alt="mastercard"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        <span className="text-[14px] text-[#101828] dark:text-dark-text font-[500]">
                          **** 8742
                        </span>
                      </div>
                    </td>
                    <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6 text-[14px] text-[#101828] dark:text-dark-text font-[500]">
                      {item.date}
                    </td>
                    <td className="h-[72px] flex justify-center items-center border-b border-[#EAECF0] dark:border-dark-border last:border-r last:border-[#EAECF0] px-6">
                      <button className="w-8 h-8 rounded-lg hover:bg-[#F2F4F7] dark:hover:bg-dark-2/20 flex items-center justify-center transition-colors">
                        <ChevronDown className="w-5 h-5 text-[#667085] dark:text-dark-text" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      </div>
    </>
  );
};

export default PaymentHistoryPage;
