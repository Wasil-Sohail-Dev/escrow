"use client";

import React, { useState, useEffect } from "react";
import { Search, Clock3, Flag, CreditCard } from "lucide-react";

// Components
import Topbar from "../../../components/dashboard/Topbar";
import HeadBar from "../../../components/dashboard/HeadBar";
import PaymentOverview from "../../../components/dashboard/PaymentOverview";
import { Input } from "@/components/ui/input";
import Pagination from "../../../components/dashboard/Pagination";

// Utils & Types
import { cn } from "@/lib/utils";
import FilterButton from "../../../components/ui/filter-button";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/helpers/fromatDate";
import { FILTER_OPTIONS, PaymentData } from "../../../lib/helpers/constants";

const TableHeader: React.FC<{
  selectAll: boolean;
  onSelectAll: () => void;
  checkboxStyle: string;
}> = ({ selectAll, onSelectAll, checkboxStyle }) => (
  <thead>
    <tr>
      <th className="h-[42px] bg-[#F9FAFB] dark:bg-dark-input-bg border-y border-[#EAECF0] dark:border-dark-border first:border-l first:rounded-l-lg first:border-[#EAECF0] px-6">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={onSelectAll}
          className={`${checkboxStyle} -ml-[24px]`}
        />
      </th>
      {['PAYMENT ID', 'STATUS', 'AMOUNT', 'P. METHOD', 'CREATION DATE'].map((header, index, arr) => (
        <th 
          key={header}
          className={`h-[56px] bg-[#F9FAFB] dark:bg-dark-input-bg border-y border-[#EAECF0] dark:border-dark-border px-6 text-left text-[14px] text-[#515866] dark:text-dark-text font-[500] ${
            index === arr.length - 1 ? 'last:border-r last:rounded-r-lg last:border-[#EAECF0]' : ''
          }`}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const PaymentHistoryPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [filters, setFilters] = useState({
    dateRange: "Last 30 days",
    status: "All",
    paymentMethod: "All",
    project: "All Projects",
    search: "",
  });

  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user?._id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/get-payment-history?customerId=${user._id}&userType=${user.userType}`);
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data);
        setFilteredPayments(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch payments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, payments]);

  const applyFilters = () => {
    let filtered = [...payments];

    // Apply date range filter
    if (filters.dateRange !== "All") {
      const today = new Date();
      let filterDate = new Date();

      switch (filters.dateRange) {
        case "Last 7 days":
          filterDate.setDate(today.getDate() - 7);
          break;
        case "Last 30 days":
          filterDate.setDate(today.getDate() - 30);
          break;
        case "Last 3 months":
          filterDate.setMonth(today.getMonth() - 3);
          break;
        case "Last 6 months":
          filterDate.setMonth(today.getMonth() - 6);
          break;
        case "Last Year":
          filterDate.setFullYear(today.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= filterDate && paymentDate <= today;
      });
    }

    // Apply status filter
    if (filters.status !== "All") {
      filtered = filtered.filter(payment => {
        // Convert status to match the display format
        const paymentStatus = payment.status.replace('_', ' ').toLowerCase();
        return paymentStatus === filters.status.toLowerCase();
      });
    }

    // Apply payment method filter
    if (filters.paymentMethod !== "All") {
      filtered = filtered.filter(payment => 
        payment.paymentMethod.toLowerCase() === filters.paymentMethod.toLowerCase()
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.stripePaymentIntentId.toLowerCase().includes(searchLower) ||
        payment.amount.toString().includes(searchLower) ||
        payment.paymentMethod.toLowerCase().includes(searchLower) ||
        payment.status.replace('_', ' ').toLowerCase().includes(searchLower)
      );
    }

    setFilteredPayments(filtered);
  };

  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredPayments.slice(
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
      setSelectedRows(currentItems.map(item => item._id));
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

  const getStatusDisplay = (status: string) => {
    return status.replace('_', ' ');
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
  );

  return (
    <>
      <Topbar
        title="Payment History"
        description="Here is a list of all your payments made done yet"
      />
      <div className="flex-1 mt-[85px]">
        <HeadBar title="Payment Overview" buttonName="Export" />
        <div className="px-4 md:px-10 lg:px-20">
          <PaymentOverview show={true} payments={filteredPayments} />

          <div className="flex mt-10 flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <FilterButton
                icon={<Clock3 className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Date range"
                options={FILTER_OPTIONS.dateRange}
                selectedOption={filters.dateRange}
                onSelect={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              />
              <FilterButton
                icon={<Flag className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Status"
                options={FILTER_OPTIONS.status}
                selectedOption={filters.status}
                onSelect={(value) => setFilters(prev => ({ ...prev, status: value }))}
              />
              <FilterButton
                icon={<CreditCard className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />}
                label="Payment Method"
                options={FILTER_OPTIONS.paymentMethod}
                selectedOption={filters.paymentMethod}
                onSelect={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}
              />
            </div>

            <div className="flex items-center gap-2 border dark:border-dark-border rounded-lg bg-[#FBFBFB] dark:bg-dark-input-bg w-full md:w-[411px] px-4 focus-within:border-primary dark:focus-within:border-primary transition-colors">
              <Search className="text-[#959BA4] dark:text-dark-text" style={{ height: '20px', width: '20px' }} />
              <Input
                placeholder="Search by amount, payment method..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-dark-text">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr 
                      key={item._id} 
                      className={cn(
                        "group hover:bg-gray-50 dark:hover:bg-dark-2/10 transition-colors",
                        index === 0 && "first-of-type:border-t-0"
                      )}
                    >
                      <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border first:border-l first:border-[#EAECF0] px-6">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item._id)}
                          onChange={() => handleSelectRow(item._id)}
                          className={checkboxStyle}
                        />
                      </td>
                      <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                        <div className="flex items-center">
                          <span className="text-[14px] text-[#101828] dark:text-dark-text font-[500] truncate max-w-[200px]">
                            {item.stripePaymentIntentId}
                          </span>
                        </div>
                      </td>
                      <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                        <div className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          item.status === "on_hold" && "bg-red-50 text-red-700 dark:bg-red-900/10",
                          item.status === "released" && "bg-green-50 text-green-700 dark:bg-green-900/10",
                          item.status === "process" && "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10",
                          item.status === "disputed" && "bg-orange-50 text-orange-700 dark:bg-orange-900/10",
                          item.status === "failed" && "bg-red-50 text-red-700 dark:bg-red-900/10",
                          item.status === "refunded" && "bg-gray-50 text-gray-700 dark:bg-gray-900/10"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full mr-1.5",
                            item.status === "on_hold" && "bg-red-500",
                            item.status === "released" && "bg-green-500",
                            item.status === "process" && "bg-yellow-500",
                            item.status === "disputed" && "bg-orange-500",
                            item.status === "failed" && "bg-red-500",
                            item.status === "refunded" && "bg-gray-500"
                          )} />
                          {getStatusDisplay(item.status)}
                        </div>
                      </td>
                      <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                        <span className="text-[14px] text-[#101828] dark:text-dark-text font-[600]">
                          ${item.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                        <div className="flex items-center gap-2">
                          
                          <span className="text-[14px] text-[#101828] dark:text-dark-text capitalize">
                            {item.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border last:border-r last:border-[#EAECF0] px-6">
                        <span className="text-[14px] text-[#101828] dark:text-dark-text">
                          {formatDate(item.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
