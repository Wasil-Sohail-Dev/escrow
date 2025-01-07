"use client";

import React, { useState } from "react";
import Topbar from "../components/Topbar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock3,
  Flag,
  CreditCard,
} from "lucide-react";
import PaymentHistory from "../components/PaymentHistory";
import Pagination from "../components/Pagination";
import HeadBar from "../components/HeadBar";
import FilterButton from "../components/FilterButton";
import { transactions } from "@/lib/data/transactions";



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

export default function TransactionDetails() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // You might want to scroll to top here
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Topbar
        title="Payment History"
        description="Here is a list of all your Payments regarding this project"
      />
      <div className="flex-1 mt-[85px]">
        <HeadBar title="Transaction Details" buttonName="Export" />
        <div className="px-4 md:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <FilterButton
                icon={
                  <Clock3 className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />
                }
                label="Date range"
                options={FILTER_OPTIONS.dateRange}
              />
              <FilterButton
                icon={
                  <Flag className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />
                }
                label="Status"
                options={FILTER_OPTIONS.status}
              />
              <FilterButton
                icon={
                  <CreditCard className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />
                }
                label="Project"
                options={FILTER_OPTIONS.project}
              />
            </div>
            <div className="flex items-center gap-2 border dark:border-dark-border rounded-lg bg-[#FBFBFB] dark:bg-dark-input-bg w-full md:w-[411px] px-4 focus-within:border-primary dark:focus-within:border-primary transition-colors">
              <Search
                className="text-[#959BA4] dark:text-dark-text"
                style={{ height: "20px", width: "20px" }}
              />
              <Input
                placeholder="Search by amount , payment method..."
                className="w-full md:w-[300px] h-[38px] md:h-[42px] border-none bg-transparent dark:text-dark-text text-[12px] md:text-[14px] placeholder:text-[#959BA4] dark:placeholder:text-dark-text/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          <PaymentHistory showFilter={false} transactions={currentItems} />
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
}
