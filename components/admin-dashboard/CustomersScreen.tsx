"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/dashboard/Pagination";
import { Input } from "@/components/ui/input";
import { toast, useToast } from "@/hooks/use-toast";
import CustomerDetailsModal from "@/components/modals/CustomerDetailsModal";
import { getStatusColor } from "@/lib/helpers/getStatusColor";
import Loader from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdmin } from "../providers/AdminProvider";
import BlockConfirmationModal from "@/components/modals/BlockConfirmationModal";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName?: string;
  phone?: string;
  userType: string;
  userStatus: string;
  profileImage: string | null;
  createdAt: string;
  projects: {
    active: number;
    completed: number;
  };
  revenue: {
    current: number;
    growth: number;
  };
}

interface Stats {
  clients: {
    total: number;
    active: number;
    blocked: number;
    pendingVerification: number;
    monthlyGrowth: number;
  };
  vendors: {
    total: number;
    active: number;
    blocked: number;
    pendingVerification: number;
    monthlyGrowth: number;
  };
  overall: {
    total: number;
    active: number;
    blocked: number;
    pendingVerification: number;
    monthlyGrowth: number;
  };
  projects: {
    active: number;
    completed: number;
  };
  revenue: {
    current: number;
    growth: number;
  };
}

const CustomersScreen = ({ userType }: { userType: string }) => {
  const { user } = useAdmin();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedCustomerForBlock, setSelectedCustomerForBlock] = useState<Customer | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        userType: userType,
        userStatus: statusFilter,
        search: debouncedSearchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/get-customers?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data.customers);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        throw new Error(data.error || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleBlockAction = (customer: Customer) => {
    setSelectedCustomerForBlock(customer);
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedCustomerForBlock) return;
    
    setProcessing(true);
    try {
      const response = await fetch("/api/update-customer-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomerForBlock._id,
          isBlocked: selectedCustomerForBlock.userStatus !== "adminInactive",
          adminId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update customer status");
      }

      toast({
        title: "Success",
        description: `Customer ${
          selectedCustomerForBlock.userStatus !== "adminInactive" ? "blocked" : "unblocked"
        } successfully`,
        variant: "default",
      });

      // Refresh customer list
      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer status",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setBlockModalOpen(false);
      setSelectedCustomerForBlock(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading2-bold text-main-heading dark:text-dark-text">
            {userType === "client" ? "Clients" : "Vendors"}
          </h1>
          <p className="text-base-regular text-dark-2">
            Manage and monitor {userType === "client" ? "clients" : "vendors"}{" "}
            accounts
          </p>
        </div>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Total {userType === "client" ? "Clients" : "Vendors"}
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {userType === "client" ? stats?.clients.total || 0 : stats?.vendors.total || 0}
          </p>
          <p className="text-small-regular text-success-text">
            +{userType === "client" ? stats?.clients.monthlyGrowth || 0 : stats?.vendors.monthlyGrowth || 0} this month
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Active {userType === "client" ? "Clients" : "Vendors"}
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {userType === "client" ? stats?.clients.active || 0 : stats?.vendors.active || 0}
          </p>
          <p className="text-small-regular text-dark-2 dark:text-dark-text/60">
            {userType === "client"
              ? stats?.clients.total
                ? Math.round((stats.clients.active / stats.clients.total) * 100)
                : 0
              : stats?.vendors.total
                ? Math.round((stats.vendors.active / stats.vendors.total) * 100)
                : 0}
            % active rate
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Blocked {userType === "client" ? "Clients" : "Vendors"}
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {userType === "client" ? stats?.clients.blocked || 0 : stats?.vendors.blocked || 0}
          </p>
          <p className="text-small-regular text-dark-2 dark:text-dark-text/60">Due to violations</p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">
            Pending Verification
          </h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {userType === "client" ? stats?.clients.pendingVerification || 0 : stats?.vendors.pendingVerification || 0}
          </p>
          <p className="text-small-regular text-warning-text dark:text-dark-text/60">
            Awaiting verification
          </p>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
        <div className="p-6 border-b border-sidebar-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <h2 className="text-heading3-bold text-main-heading dark:text-dark-text">
              {userType === "client" ? "Client List" : "Vendor List"}
            </h2>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary dark:focus:border-primary [&>option]:bg-white [&>option]:dark:bg-dark-bg [&>option]:dark:text-dark-text"
              >
                <option value="all" className="text-paragraph dark:text-dark-text">
                  All {userType === "client" ? "Clients" : "Vendors"}
                </option>
                <option value="active" className="text-paragraph dark:text-dark-text">
                  Active
                </option>
                <option value="adminInactive" className="text-paragraph dark:text-dark-text">
                  Inactive
                </option>
                <option value="pendingVerification" className="text-paragraph dark:text-dark-text">
                  Pending
                </option>
              </select>
              <Input
                type="text"
                placeholder="Search clients..."
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
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  {userType === "client" ? "Client Details" : "Vendor Details"}
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Projects
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Revenue
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-4">
                    <Loader
                      size="md"
                      text="Loading customers..."
                      fullHeight={false}
                    />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-dark-2 dark:text-dark-text/60"
                  >
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="border-b border-sidebar-border dark:border-dark-border"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                          {customer.profileImage ? (
                            <img
                              src={customer.profileImage}
                              alt={customer.firstName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span>
                              {customer.firstName?.[0]}
                              {customer.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-base-semibold text-paragraph dark:text-dark-text">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-small-regular text-dark-2">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 text-small-medium rounded-full ${getStatusColor(
                          customer.userStatus
                        )}`}
                      >
                        {customer.userStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-base-medium text-paragraph dark:text-dark-text">
                          {customer.projects.active} Active
                        </p>
                        <p className="text-small-regular text-dark-2">
                          {customer.projects.completed} Completed
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-base-medium text-paragraph dark:text-dark-text">
                          ${customer.revenue.current.toLocaleString()}
                        </p>
                        <p
                          className={`text-small-regular ${
                            customer.revenue.growth >= 0
                              ? "text-success-text"
                              : "text-error-text"
                          }`}
                        >
                          {customer.revenue.growth >= 0 ? "+" : ""}
                          {customer.revenue.growth}% this month
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="text-small-medium text-primary hover:text-primary-500"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleBlockAction(customer)}
                          className={`text-small-medium ${
                            customer.userStatus === "adminInactive"
                              ? "text-success-text hover:text-success-btn"
                              : "text-error-text hover:text-error-btn"
                          }`}
                          disabled={
                            processing ||
                            !["active", "adminInactive"].includes(
                              customer.userStatus
                            )
                          }
                          style={{
                            display: ["active", "adminInactive"].includes(
                              customer.userStatus
                            )
                              ? "block"
                              : "none",
                          }}
                        >
                          {customer.userStatus === "adminInactive"
                            ? "Unblock"
                            : "Block"}
                        </button>
                      </div>
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

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        customer={selectedCustomer}
      />

      {/* Add the BlockConfirmationModal */}
      <BlockConfirmationModal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setSelectedCustomerForBlock(null);
        }}
        onConfirm={handleConfirmBlock}
        isBlocking={selectedCustomerForBlock?.userStatus !== "adminInactive"}
        processing={processing}
      />
    </div>
  );
};

export default CustomersScreen;
