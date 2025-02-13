"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import Topbar from "../../../../components/dashboard/Topbar";
import HeadBar from "../../../../components/dashboard/HeadBar";
import PaymentHistory, { Transaction } from "../../../../components/dashboard/PaymentHistory";
import Pagination from "../../../../components/dashboard/Pagination";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { Contract } from "@/contexts/ContractContext";
import { formatDate } from "@/lib/helpers/fromatDate";
import FilterButton from "@/components/ui/filter-button";
import { Clock3, CreditCard, Flag, Search } from "lucide-react";
import { FILTER_OPTIONS } from "@/lib/helpers/constants";
import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";
import Loader from "@/components/ui/loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import debounce from "lodash/debounce";

export default function DisputeManagementScreenDetails({
  params,
}: {
  params: Promise<{ disputes: string }>;
}) {
  const param = use(params);
  const { disputes } = param;
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useUser();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [projectOptions, setProjectOptions] = useState<string[]>(["All Projects"]);
  const [filters, setFilters] = useState({
    dateRange: "All",
    status: "All",
    project: "All Projects"
  });
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  const fetchContractStatus = async (pageNum: number = 1) => {
    const customerId = user?._id;
    if (!customerId) return;

    if (pageNum === 1) {
      setLoading(true);
    } else {
      setTableLoading(true);
    }

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        customerId,
        role: user.userType,
        status: disputes,
        page: pageNum.toString(),
      });

      // Add search if present
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      // Add date range if present
      if (startDate) {
        queryParams.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        queryParams.append('endDate', endDate.toISOString());
      }

      // Add project filter if not "All Projects"
      if (filters.project !== "All Projects") {
        queryParams.append('project', filters.project);
      }

      const response = await fetch(
        `/api/get-contract-status?${queryParams.toString()}`
      );
      const { data, pagination, filterOptions } = await response.json();
      
      if (Array.isArray(data)) {
        setContracts(data);
        setTotalItems(pagination.total);
        setHasMore(pagination.page < pagination.totalPages);
        setProjectOptions(filterOptions.projects);
      } else {
        console.error("Invalid data format received:", data);
        setContracts([]);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setCurrentPage(1);
      fetchContractStatus(1);
    }
  }, [user, searchTerm, dateRange, filters.project]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    fetchContractStatus(pageNumber);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouncedSearch(value);
  };

  const title =
    disputes === "disputed"
      ? "Total Disputes"
      : disputes === "disputed_in_process"
      ? "Pending Disputes"
      : disputes === "disputed_in_process"
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
          <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  
                  <FilterButton
                    icon={
                      <CreditCard className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />
                    }
                    label="Project"
                    options={projectOptions}
                    selectedOption={filters.project}
                    onSelect={(value) => handleFilterChange('project', value)}
                  />
                </div>
                <div className="flex items-center gap-2 border dark:border-dark-border rounded-lg bg-[#FBFBFB] dark:bg-dark-input-bg w-full md:w-[411px] px-4 focus-within:border-primary dark:focus-within:border-primary transition-colors">
                  <Search className="text-[#959BA4] dark:text-dark-text" style={{ height: '20px', width: '20px' }} />
                  <Input
                    value={searchInputValue}
                    onChange={handleSearchChange}
                    placeholder="Search by dispute ID, project name..."
                    className="w-full md:w-[300px] h-[38px] md:h-[42px] border-none bg-transparent dark:text-dark-text text-[12px] md:text-[14px] placeholder:text-[#959BA4] dark:placeholder:text-dark-text/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <PaymentHistory
                showFilter={true}
                transactions={contracts?.map((contract: Contract) => {
                  let transactionStatus: Transaction['status'] = 'pending';
                  switch(contract.status.toLowerCase()) {
                    case 'disputed':
                      transactionStatus = 'pending';
                      break;
                    case 'disputed_in_process':
                      transactionStatus = 'in-progress';
                      break;
                    case 'resolved':
                      transactionStatus = 'delivered';
                      break;
                    default:
                      transactionStatus = 'pending';
                  }

                  return {
                    id: contract.contractId,
                    milestoneName: contract.title || "Untitled Contract",
                    contractId: contract.contractId,
                    date: formatDate(contract.createdAt),
                    status: transactionStatus,
                    amount: `$${contract.budget?.toFixed(2)}`,
                  };
                }) || []}
                dispute={true}
                startDateFilter={startDate}
                endDateFilter={endDate}
                setDateRangeFilter={setDateRange}
                loading={loading}
              />
              {contracts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}

                  
                    
                />
              )}
            </>
        </div>
      </div>
    </>
  );
}
