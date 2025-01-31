"use client";

import React, { use, useEffect, useState } from "react";
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
  const [filters, setFilters] = useState({
    dateRange: "All",
    status: "All",
    project: "All Projects"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const title =
    disputes === "disputed"
      ? "Total Disputes"
      : disputes === "disputed_in_process"
      ? "Pending Disputes"
      : disputes === "disputed_in_process"
      ? "In Progress Disputes"
      : "Resolved Disputes";

  // Get paginated and filtered contracts
  const getPaginatedContracts = () => {
    if (!contracts || contracts.length === 0) return [];
    
    // Apply filters
    let filteredContracts = [...contracts];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredContracts = filteredContracts.filter(contract => 
        contract.contractId.toLowerCase().includes(searchLower) ||
        contract.title.toLowerCase().includes(searchLower) ||
        contract.budget.toString().includes(searchLower)
      );
    }

    // Date range filter
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
        case "Last year":
          filterDate.setFullYear(today.getFullYear() - 1);
          break;
      }

      filteredContracts = filteredContracts.filter(contract => {
        const contractDate = new Date(contract.createdAt);
        return contractDate >= filterDate && contractDate <= today;
      });
    }

    // Status filter
    if (filters.status !== "All") {
      filteredContracts = filteredContracts.filter(contract => {
        const contractStatus = contract.status.toLowerCase().replace('_', ' ');
        return contractStatus === filters.status.toLowerCase();
      });
    }

    // Project filter
    if (filters.project !== "All Projects") {
      filteredContracts = filteredContracts.filter(contract => 
        contract.title === filters.project
      );
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredContracts.slice(startIndex, Math.min(endIndex, filteredContracts.length));
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Get unique project names for the project filter
  const projectOptions = ["All Projects", ...new Set(contracts.map(c => c.title))];

  const totalItems = contracts?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const getUserId = (user: string | { _id: string; userName: string }) => {
    return typeof user === 'string' ? user : user._id;
  };

  const fetchUserNames = async (userIds: string[]) => {
    try {
      const response = await fetch('/api/get-users-by-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
      });
      const { data } = await response.json();
      const namesMap: {[key: string]: string} = {};
      data.forEach((user: { _id: string; userName: string }) => {
        namesMap[user._id] = user.userName;
      });
    } catch (error) {
      console.error("Error fetching user names:", error);
    }
  };

  useEffect(() => {
    if (contracts.length > 0) {
      const userIds = [...new Set([
        ...contracts.map(c => getUserId(c.clientId)),
        ...contracts.map(c => getUserId(c.vendorId))
      ])];
      fetchUserNames(userIds);
    }
  }, [contracts]);

  const fetchContractStatus = async () => {
    const customerId = user?._id;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/get-contract-status?customerId=${customerId}&role=${user?.userType}&status=${disputes}`
      );
      const { data } = await response.json();
      if (Array.isArray(data)) {
        setContracts(data);
        console.log("Fetched contracts:", data.length);
      } else {
        console.error("Invalid data format received:", data);
        setContracts([]);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContractStatus();
    }
  }, [user]);

  console.log(contracts, "contracts");

  return (
    <>
      <Topbar
        title={title}
        description={"Here is a list of all your " + title}
      />
      <div className="flex-1 mt-[85px]">
        <HeadBar title={title} buttonName="Export" />
        <div className="px-4 md:px-10 lg:px-20">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  <FilterButton
                    icon={
                      <Clock3 className="h-[14px] w-[14px] text-[#4B5563] dark:text-dark-text" />
                    }
                    label="Date range"
                    options={FILTER_OPTIONS.dateRange}
                    selectedOption={filters.dateRange}
                    onSelect={(value) => handleFilterChange('dateRange', value)}
                  />
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
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    placeholder="Search by dispute ID, project name..."
                    className="w-full md:w-[300px] h-[38px] md:h-[42px] border-none bg-transparent dark:text-dark-text text-[12px] md:text-[14px] placeholder:text-[#959BA4] dark:placeholder:text-dark-text/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <PaymentHistory
                showFilter={true}
                transactions={getPaginatedContracts()?.map((contract: Contract) => {
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
                    amount: `$${contract.budget.toFixed(2)}`,
                  };
                }) || []}
                dispute={true}
              />
              {contracts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
