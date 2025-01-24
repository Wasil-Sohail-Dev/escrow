"use client";

import React, { useState, useEffect } from "react";
import Topbar from "../../../../components/dashboard/Topbar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock3,
  Flag,
} from "lucide-react";
import PaymentHistory, { Transaction } from "../../../../components/dashboard/PaymentHistory";
import Pagination from "../../../../components/dashboard/Pagination";
import HeadBar from "../../../../components/dashboard/HeadBar";
import FilterButton from "../../../../components/dashboard/FilterButton";
import { useParams } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/ui/loader";

interface PaymentData {
  _id: string;
  contractId: string;
  contractTitle?: string;
  payerId: {
    _id: string;
    email: string;
    userName: string;
  };
  payeeId: {
    _id: string;
    email: string;
    userName: string;
  };
  amount: number;
  platformFee: number;
  escrowAmount: number;
  stripePaymentIntentId: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

const FILTER_OPTIONS = {
  dateRange: [
    "Last 7 days",
    "Last 30 days",
    "Last 3 months",
    "Last 6 months",
    "Last year",
  ],
  status: [
    "Funded",
    "Pending", 
    "Cancelled"
  ]
};

export default function TransactionDetails() {
  const { contractId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const itemsPerPage = 5;

  const fetchPaymentHistory = async () => {
    if (!contractId) return;

    try {
      setLoading(true);
      const { data } = await axios.get(`/api/get-payment-history?contractId=${contractId}`);
      
      if (data.success) {
        setPayments(data.data);
        setTotalPayments(data.totalPayments);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch payment history",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching payment history:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchPaymentHistory();
    }
  }, [contractId]);

  // Filter and search logic
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === "" || 
      payment.amount.toString().includes(searchTerm) ||
      payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payeeId.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.contractTitle?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "" || 
      payment.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter) {
      const paymentDate = new Date(payment.createdAt);
      const today = new Date();
      const daysAgo = (today.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24);

      switch (dateFilter) {
        case "Last 7 days":
          matchesDate = daysAgo <= 7;
          break;
        case "Last 30 days":
          matchesDate = daysAgo <= 30;
          break;
        case "Last 3 months":
          matchesDate = daysAgo <= 90;
          break;
        case "Last 6 months":
          matchesDate = daysAgo <= 180;
          break;
        case "Last year":
          matchesDate = daysAgo <= 365;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleExport = () => {
    const csvContent = [
      ["Contract", "Date", "Vendor", "Status", "Amount"],
      ...filteredPayments.map(payment => [
        payment.contractTitle || "Untitled Contract",
        new Date(payment.createdAt).toLocaleDateString(),
        payment.payeeId.userName,
        payment.status,
        `$${payment.amount.toFixed(2)}`
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment_history_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const transformedTransactions: Transaction[] = paginatedPayments.map(payment => ({
    id: payment._id,
    milestoneName: payment?.contractTitle || "Untitled Contract",
    date: new Date(payment.createdAt).toLocaleDateString(),
    vendorName: payment.payeeId.userName,
    status: payment.status.toLowerCase() as Transaction["status"],
    amount: `$${payment.amount.toFixed(2)}`,
  }));

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Topbar
        title="Payment History"
        description="Here is a list of all your Payments regarding this project"
      />
      <div className="flex-1 mt-[85px]">
        <HeadBar 
          title="Transaction Details" 
          buttonName="Export" 
          onExport={handleExport}
        />
        <div className="px-4 md:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <FilterButton
                icon={<Clock3 className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Date range"
                options={FILTER_OPTIONS.dateRange}
                selectedOption={dateFilter}
                onSelect={(value: string) => setDateFilter(value)}
              />
              <FilterButton
                icon={<Flag className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Status"
                options={FILTER_OPTIONS.status}
                selectedOption={statusFilter}
                onSelect={(value: string) => setStatusFilter(value)}
              />
            </div>
            <div className="flex items-center gap-2 border dark:border-dark-border rounded-lg bg-[#FBFBFB] dark:bg-dark-input-bg w-full md:w-[411px] px-4 focus-within:border-primary dark:focus-within:border-primary transition-colors">
              <Search
                className="text-[#959BA4] dark:text-dark-text"
                style={{ height: "20px", width: "20px" }}
              />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by amount, payment method..."
                className="w-full md:w-[300px] h-[38px] md:h-[42px] border-none bg-transparent dark:text-dark-text text-[12px] md:text-[14px] placeholder:text-[#959BA4] dark:placeholder:text-dark-text/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader size="lg" text="Loading payment history..." />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex justify-center items-center min-h-[200px] text-paragraph dark:text-dark-text">
              No payment history found
            </div>
          ) : (
            <>
              <PaymentHistory showFilter={false} transactions={transformedTransactions} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredPayments.length}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
} 