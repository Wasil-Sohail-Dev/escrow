import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TableHeader {
  key: string;
  label: string;
  className?: string;
}

export interface Transaction {
  id: string;
  milestoneName: string;
  date: string;
  vendorName: string;
  status: "pending" | "cancelled" | "delivered" | "in-progress" | "funded";
  amount: string;
}

interface PaymentHistoryProps {
  showFilter: boolean;
  transactions: Transaction[];
  dispute?: boolean;
}

const PAYMENT_HEADERS: TableHeader[] = [
  { key: "projectName", label: "Project Name" },
  { key: "orderId", label: "Order ID" },
  { key: "date", label: "Date" },
  { key: "vendorName", label: "Vendor name" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount" },
  { key: "action", label: "Action" },
];

const DISPUTE_HEADERS: TableHeader[] = [
  { key: "projectName", label: "Project Name" },
  { key: "disputeId", label: "Dispute ID" },
  { key: "date", label: "Date Created" },
  { key: "vendorName", label: "Vendor name" },
  { key: "status", label: "Status" },
  { key: "subject", label: "Subject" },
  { key: "action", label: "Action" },
];

export default function PaymentHistory({
  showFilter,
  transactions,
  dispute,
}: PaymentHistoryProps) {
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
        return "bg-black";
    }
  };

  return (
    <div className="mt-8">
      {showFilter && (
        <div className="flex md:justify-between md:flex-row flex-col items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold leading-[28.5px] dark:text-dark-text lg:text-[22px] md:text-[20px] max-md:text-[18px]">
              {dispute ? "Dispute Details" : "Payment History"}
            </h2>
          </div>
          {!dispute && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-small-medium px-3 py-1.5 rounded-md dark:bg-dark-bg dark:text-dark-text">
                28 jan, 2021 - 28 Dec, 2021
                <ChevronDown size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="dark:bg-dark-bg dark:border-dark-border"
              >
                <DropdownMenuItem className="text-small-medium dark:text-dark-text dark:hover:bg-white/5">
                  28 jan, 2021 - 28 Dec, 2021
                </DropdownMenuItem>
                <DropdownMenuItem className="text-small-medium dark:text-dark-text dark:hover:bg-white/5">
                  28 jan, 2021 - 28 Dec, 2021
                </DropdownMenuItem>
                <DropdownMenuItem className="text-small-medium dark:text-dark-text dark:hover:bg-white/5">
                  28 jan, 2021 - 28 Dec, 2021
                </DropdownMenuItem>
                <DropdownMenuItem className="text-small-medium dark:text-dark-text dark:hover:bg-white/5">
                  28 jan, 2021 - 28 Dec, 2021
                </DropdownMenuItem>
                <DropdownMenuItem className="text-small-medium dark:text-dark-text dark:hover:bg-white/5">
                  28 jan, 2021 - 28 Dec, 2021
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
            {transactions.map((transaction, index) => (
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
                <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  {transaction.vendorName}
                </td>
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
                <td className="lg:py-4 lg:px-4 md:py-3 md:px-3 max-md:py-2 max-md:px-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#292929] dark:text-dark-text hover:bg-[#F2F4F7] dark:hover:bg-dark-2/20"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className=" p-2 bg-white dark:bg-dark-bg border dark:border-dark-border"
                    >
                      <DropdownMenuItem className="flex items-center justify-center gap-2 px-3 py-2 text-[14px] font-[500] text-black dark:text-dark-text hover:bg-[#F9FAFB] dark:hover:bg-dark-2/20 cursor-pointer rounded-lg">
                        {dispute ? "Resolve" : "Track Payment"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
