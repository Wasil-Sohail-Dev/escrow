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
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    dateRange: "Last 30 days",
    status: "all",
    paymentMethod: "all",
    search: "",
  });

  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null
  });

  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    onHoldAmount: 0,
    releasedAmount: 0
  });

  // Handle custom date range selection
  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setDateRange({ startDate: start, endDate: end });
    if (start && end) {
      setFilters(prev => ({ ...prev, dateRange: "Custom Range" }));
    }
  };

  // Calculate dates based on filter
  useEffect(() => {
    if (filters.dateRange === "Custom Range") return;

    const today = new Date();
    let start = null;
    
    switch (filters.dateRange) {
      case "Last 7 days":
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case "Last 30 days":
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case "Last 3 months":
        start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        break;
      case "Last 6 months":
        start = new Date(today);
        start.setMonth(today.getMonth() - 6);
        break;
      case "Last Year":
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        start = null;
        break;
    }
    
    setDateRange({
      startDate: start,
      endDate: filters.dateRange === "all" ? null : today
    });
  }, [filters.dateRange]);

  // Add debounce function
  const debounce = (func: Function, wait: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    const debouncedFn = (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), wait);
    };
    debouncedFn.cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    return debouncedFn;
  };

  // Create debounced fetch
  const debouncedFetch = React.useCallback(
    debounce(() => {
      fetchPayments();
    }, 500),
    [filters, currentPage]
  );

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  // Handle filter changes with debounce
  useEffect(() => {
    if (user) {
      debouncedFetch();
    }
    return () => {
      debouncedFetch.cleanup();
    };
  }, [filters, currentPage]);

  // Update search handler
  const handleSearch = (value: string) => {
    setCurrentPage(1); // Reset to first page on new search
    setFilters(prev => ({ ...prev, search: value }));
  };

  const fetchPayments = async () => {
    if (!user?._id) return;
    
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        customerId: user._id,
        userType: user.userType,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: filters.status.toLocaleLowerCase(),
        paymentMethod: filters.paymentMethod.toLocaleLowerCase(),
        search: filters.search,
      });

      // Add date params only if both dates are present
      if (dateRange.startDate && dateRange.endDate) {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/get-payment-history?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data);
        setTotalItems(data.pagination.total);
        setPaymentStats(data.stats);
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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(payments.map(item => item._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id];
      setSelectAll(newSelection.length === payments.length);
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
        description="Here is all of your Third Party payment history"
      />
      <div className="flex-1 mt-[85px]">
        <HeadBar 
          title="Payment Overview" 
          buttonName="Export" 
          payments={payments}
        />
        <div className="px-4 md:px-10 lg:px-20">
          <PaymentOverview 
            show={true} 
            showDateFilter={true}
            payments={payments}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            dateRange={filters.dateRange}
            onDateRangeChange={handleDateRangeChange}
            onDateOptionChange={(option) => setFilters(prev => ({ ...prev, dateRange: option }))}
            stats={paymentStats}
          />

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
                placeholder="Search by payment ID, amount, method..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
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
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-dark-text">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((item, index) => (
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
                          item.status === "processing" && "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10",
                          item.status === "funded" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10", 
                          item.status === "on_hold" && "bg-red-50 text-red-700 dark:bg-red-900/10",
                          item.status === "partially_released" && "bg-blue-50 text-blue-700 dark:bg-blue-900/10",
                          item.status === "fully_released" && "bg-green-50 text-green-700 dark:bg-green-900/10",
                          item.status === "failed" && "bg-red-50 text-red-700 dark:bg-red-900/10",
                          item.status === "refunded" && "bg-gray-50 text-gray-700 dark:bg-gray-900/10",
                          item.status === "disputed" && "bg-orange-50 text-orange-700 dark:bg-orange-900/10"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full mr-1.5",
                            item.status === "processing" && "bg-yellow-500",
                            item.status === "funded" && "bg-emerald-500",
                            item.status === "on_hold" && "bg-red-500", 
                            item.status === "partially_released" && "bg-blue-500",
                            item.status === "fully_released" && "bg-green-500",
                            item.status === "failed" && "bg-red-500",
                            item.status === "refunded" && "bg-gray-500",
                            item.status === "disputed" && "bg-orange-500"
                          )} />
                          {getStatusDisplay(item.status)}
                        </div>
                      </td>
                      <td className="h-[72px] border-b border-[#EAECF0] dark:border-dark-border px-6">
                        <span className="text-[14px] text-[#101828] dark:text-dark-text font-[600]">
                          ${item.totalAmount?.toFixed(2)}
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
            totalPages={Math.ceil(totalItems / itemsPerPage)}
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
