"use client";

import React, { use, useState } from "react";
import { Clock3, Flag, CreditCard } from "lucide-react";
import { disputeData, transactions } from "@/lib/data/transactions";
import Topbar from "../../components/Topbar";
import HeadBar from "../../components/HeadBar";
import FilterButton from "../../components/FilterButton";
import PaymentHistory from "../../components/PaymentHistory";
import Pagination from "../../components/Pagination";

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

export default function DisputeManagementScreenDetails({
  params,
}: {
  params: Promise<{ disputes: string }>;
}) {
  const param = use(params);
  const { disputes } = param;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalItems = disputeData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const disputesStatus =
    disputes === "total-disputes"
      ? "all"
      : disputes === "pending-disputes"
      ? "pending"
      : disputes === "in-progress-disputes"
      ? "in-progress"
      : "delivered";

  const currentItems = disputeData
    .slice(indexOfFirstItem, indexOfLastItem)
    .filter((item) => {
      if (disputesStatus === "all") {
        return item;
      }
      return item.status === disputesStatus;
    });

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const title =
    disputes === "total-disputes"
      ? "Total Disputes"
      : disputes === "pending-disputes"
      ? "Pending Disputes"
      : disputes === "in-progress-disputes"
      ? "In Progress Disputes"
      : "Resolved Disputes";

  return (
    <>
      <Topbar
        title={title}
        description={"Here is a list of all your " + title}
      />
      <div className="flex-1 mt-[85px]">
        <HeadBar title={title} buttonName="Export" />
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
          </div>
          <PaymentHistory
            showFilter={true}
            transactions={currentItems}
            dispute={true}
          />
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
