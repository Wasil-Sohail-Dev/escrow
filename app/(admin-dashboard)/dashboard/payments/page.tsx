"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import Pagination from "@/components/dashboard/Pagination";
import { formatDate } from "@/lib/helpers/fromatDate";
import { Input } from "@/components/ui/input";
import { getStatusBadgeClass } from "@/lib/helpers/getStatusColor";
import Loader from "@/components/ui/loader";
import { Download } from "lucide-react";
import { handleDownloadStatement } from "@/lib/helpers/handleDownloadStatement";

interface Payment {
  _id: string;
  stripePaymentIntentId: string;
  contractId: {
    _id: string;
    title: string;
    milestones: Array<{
      title: string;
      amount: number;
      startDate: string;
      endDate: string;
    }>;
    currentMilestone: number;
  };
  payerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalEarnings: {
    amount: number;
    growth: number;
  };
  pending: {
    amount: number;
    count: number;
  };
  inEscrow: {
    amount: number;
    count: number;
  };
  released: {
    amount: number;
  };
}

interface UpcomingPayment {
  _id: string;
  title: string;
  milestone: {
    title: string;
    amount: number;
    endDate: string;
  };
  daysUntilDue: number;
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: statusFilter,
        search: debouncedSearchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/get-payments?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.data.payments);
        setStats(data.data.stats);
        setUpcomingPayments(data.data.upcomingPayments);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        throw new Error(data.error || "Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  console.log(payments[0]?.contractId.milestones.length,"payment");
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading2-bold text-main-heading dark:text-dark-text">Payments</h1>
          <p className="text-base-regular text-dark-2">Track your payments and transactions</p>
        </div>
        <button 
          onClick={()=>handleDownloadStatement(stats,payments,upcomingPayments)}
          disabled={loading || payments.length === 0}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-base-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download Statement
        </button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Total Earnings</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            ${stats?.totalEarnings.amount.toLocaleString()}
          </p>
          <p className="text-small-regular text-success-text">
            {(stats?.totalEarnings?.growth ?? 0) >= 0 ? "+" : ""}
            {stats?.totalEarnings?.growth ?? 0}% from last month
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Pending</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            ${stats?.pending.amount.toLocaleString()}
          </p>
          <p className="text-small-regular text-dark-2">
            {stats?.pending.count} payments pending
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">In Escrow</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            ${stats?.inEscrow.amount.toLocaleString()}
          </p>
          <p className="text-small-regular text-dark-2">
            {stats?.inEscrow.count} milestones in progress
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Released</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            ${stats?.released.amount.toLocaleString()}
          </p>
          <p className="text-small-regular text-dark-2">This month</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
        <div className="p-6 border-b border-sidebar-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <h2 className="text-heading3-bold text-main-heading dark:text-dark-text">Payment History</h2>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary dark:focus:border-primary [&>option]:bg-white [&>option]:dark:bg-dark-bg [&>option]:dark:text-dark-text"
              >
                <option value="all" className="text-paragraph dark:text-dark-text">
                  All Payments
                </option>
                <option value="processing" className="text-paragraph dark:text-dark-text">
                  Processing
                </option>
                <option value="funded" className="text-paragraph dark:text-dark-text">
                  Funded
                </option>
                <option value="partially_released" className="text-paragraph dark:text-dark-text">
                  Partially Released
                </option>
                <option value="fully_released" className="text-paragraph dark:text-dark-text">
                  Fully Released
                </option>
              </select>
              <Input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="px-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sidebar-border dark:border-dark-border">
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">Transaction ID</th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">Project</th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">Client</th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">Amount</th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">Status</th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4">
                    <Loader size="md" text="Loading payments..." fullHeight={false} />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-dark-2 dark:text-dark-text/60">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-sidebar-border dark:border-dark-border">
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      #{payment.stripePaymentIntentId.slice(-8)}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-base-semibold text-paragraph dark:text-dark-text">
                          {payment.contractId.title}
                        </p>
                        <p className="text-small-regular text-dark-2">
                          Milestone {payment.contractId.milestones.length + 1}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {payment.payerId.firstName} {payment.payerId.lastName}
                    </td>
                    <td className="py-4 px-6 text-base-semibold text-paragraph dark:text-dark-text">
                      ${payment.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-small-medium rounded-full ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-base-regular text-dark-2">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border p-6">
        <h2 className="text-heading3-bold text-main-heading dark:text-dark-text mb-4">Upcoming Payments</h2>
        <div className="space-y-4">
          {upcomingPayments.length > 0 ? upcomingPayments.map((payment) => (
            <div key={payment._id} className="flex items-center justify-between p-4 border border-sidebar-border dark:border-dark-border rounded-lg">
              <div>
                <p className="text-base-semibold text-paragraph dark:text-dark-text">
                  {payment.title} - {payment.milestone.title}
                </p>
                <p className="text-small-regular text-dark-2">
                  Due in {payment.daysUntilDue} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-base-semibold text-paragraph dark:text-dark-text">
                  ${payment.milestone.amount.toLocaleString()}
                </p>
                <button className="text-small-medium text-primary">View Details</button>
              </div>
            </div>
          )) : (
            <p className="text-small-regular text-dark-2 text-center dark:text-dark-text">No upcoming payments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage; 