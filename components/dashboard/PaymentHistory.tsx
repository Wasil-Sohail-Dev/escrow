import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import DisputeDetailsModal from "../modals/DisputeDetailsModal";
import Loader from "../ui/loader";

interface TableHeader {
  key: string;
  label: string;
  className?: string;
}

export interface Transaction {
  id: string;
  milestoneName: string;
  date: string;
  vendorName?: string;
  status: "pending" | "cancelled" | "delivered" | "in-progress" | "funded";
  amount: string;
  contractId?: string;
}

interface PaymentHistoryProps {
  showFilter: boolean;
  transactions: Transaction[];
  dispute?: boolean;
  showOnlyOne?: boolean;
  paramContractId?: string;
  startDateFilter?: Date | null;
  endDateFilter?: Date | null;
  setDateRangeFilter?: (dateRange: [Date | null, Date | null]) => void;
  loading?: boolean;
}

export default function PaymentHistory({
  showFilter,
  transactions: initialTransactions,
  dispute,
  showOnlyOne,
  paramContractId,
  startDateFilter,
  endDateFilter,
  setDateRangeFilter,
  loading,
}: PaymentHistoryProps) {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filteredTransactions, setFilteredTransactions] = useState(initialTransactions);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  
  useEffect(() => {
    if (paramContractId) {
      setSelectedContractId(paramContractId);
      setIsDisputeModalOpen(true);
    }
  }, [paramContractId]);

  useEffect(() => {
    if (!initialTransactions?.length) {
      setFilteredTransactions([]);
      return;
    }
    filterTransactions();
  }, [dateRange, initialTransactions]);

  const filterTransactions = () => {
    if (!initialTransactions?.length){
      setFilteredTransactions([]);
      return;
    }
    let filtered = [...initialTransactions];
    if (startDate && endDate) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    } 
    setFilteredTransactions(filtered);
  };

  const PAYMENT_HEADERS: TableHeader[] = [
    { key: "projectName", label: "Project Name" },
    { key: "orderId", label: "Order ID" },
    { key: "date", label: "Date" },
    { key: "vendorName", label: user?.userType === 'vendor' ? "Client name" : "Vendor name" },
    { key: "status", label: "Status" },
    { key: "amount", label: "Amount" },
    // { key: "action", label: "Action" },
  ];
  
  const DISPUTE_HEADERS: TableHeader[] = [
    { key: "projectName", label: "Project Name" },
    { key: "disputeId", label: "Dispute ID" },
    { key: "date", label: "Date Created" },
    // { key: "vendorName", label: user?.userType === 'vendor' ? "Client name" : "Vendor name" },
    { key: "status", label: "Status" },
    { key: "subject", label: "Buget" },
    { key: "action", label: "Action" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#F29A2E]";
      case "cancelled":
        return "bg-[#EF0606]";
      case "delivered":
        return "bg-[#4CE13F]";
      case "in-progress":
        return "bg-[#4CE13F]";
      case "funded":
        return "bg-[#00BA88]";
      default:
        return "bg-[#F29A2E]";
    }
  };

  const handleViewDispute = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsDisputeModalOpen(true);
  };

  return (
    <div className="mt-8">
      {showFilter && (
        <div className="flex md:justify-between md:flex-row flex-col items-center mb-4 md:gap-0 gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold leading-[28.5px] dark:text-dark-text lg:text-[22px] md:text-[20px] max-md:text-[18px]">
              {dispute ? "Dispute Details" : "Payment History"}
            </h2>
          </div>
            <div className="flex gap-4">
              <DatePicker
                selectsRange={true}
                startDate={startDateFilter || startDate}
                endDate={endDateFilter || endDate}
                onChange={(update) => {
                  if (setDateRangeFilter) {
                    setDateRangeFilter(update);
                  }else{
                    setDateRange(update);
                  }
                }}
                isClearable={true}
                placeholderText="Select date range"
                className="flex items-center gap-2 text-small-medium px-3 py-1.5 rounded-md dark:bg-dark-bg dark:text-dark-text border border-input"
              />
            </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F2F4FF] dark:bg-[#4C4C4C]">
            <tr className="lg:text-base-regular md:text-base-regular max-md:text-small-regular text-[#292929] dark:text-dark-text">
              {(dispute ? DISPUTE_HEADERS : PAYMENT_HEADERS).map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    "lg:py-3 lg:px-4 md:py-2.5 md:px-3 max-md:py-2 max-md:px-2 text-left",
                    header.className
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="w-full">
            {loading ? (
              <tr>
              <td colSpan={7} className="text-center pt-4 dark:text-dark-text/60"><Loader fullHeight={false} /></td>
            </tr>
            ) : (
              <>
              {filteredTransactions?.length > 0 ? (showOnlyOne?[filteredTransactions[0]]:filteredTransactions).map((transaction, index) => (
                <tr
                  key={index}
                className="lg:text-base-regular md:text-base-regular max-md:text-small-regular border-t dark:border-dark-border text-[#292929] dark:text-dark-text/60"
              >
                <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2 font-medium">
                  {transaction.milestoneName}
                </td>
                <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  {transaction.id}
                </td>
                <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  {transaction.date}
                </td>
                {!dispute && <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  {transaction.vendorName}
                </td>}
                <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 ${getStatusColor(
                        transaction.status
                      )} rounded-full`}
                    ></span>
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </span>
                </td>
                <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  {transaction.amount}
                </td>
                {dispute && <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDispute(transaction?.contractId || "")}
                      className="text-[#292929] dark:text-dark-text hover:bg-[#F2F4F7] dark:hover:bg-dark-2/20"
                    >
                      <Eye className="h-5 w-5 text-primary" style={{fontSize: "20px",height: "24px",width: "24px"}} />
                    </Button>
                  </div>
                </td>}
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-4 dark:text-dark-text/60">No transactions found</td>
              </tr>
            )}
            </>
          )}
          </tbody>
        </table>
      </div>

      <DisputeDetailsModal 
        isOpen={isDisputeModalOpen}
        onClose={() => {
          setIsDisputeModalOpen(false);
          setSelectedContractId("");
        }}
        contractId={selectedContractId}
      />
    </div>
  );
}
