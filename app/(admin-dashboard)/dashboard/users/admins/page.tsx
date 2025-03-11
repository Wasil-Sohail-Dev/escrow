"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";
import Loader from "@/components/ui/loader";
import CreateAdminModal from "@/components/modals/CreateAdminModal";
import { formatDate } from "@/lib/helpers/fromatDate";

interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  userType: "super_admin" | "admin" | "moderator";
  userStatus: "active" | "inactive";
  permissions: string[];
  lastLogin: string;
  createdAt: string;
}

const AdminsPage = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/get-admins?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}&search=${searchTerm}`
      );
      const data = await response.json();

      if (data.success) {
        setAdmins(data.data);
        setTotalItems(data.pagination.total);
      } else {
        throw new Error(data.error || "Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Error",
        description: "Failed to fetch admins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, statusFilter, searchTerm]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/update-admin-status", { 
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Admin status updated successfully",
        });
        fetchAdmins();
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getPermissionLabel = (permission: string) => {
    return permission
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-main-heading dark:text-dark-text">
          Admin Management
        </h1>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
        <div className="p-6 border-b border-sidebar-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <h2 className="text-heading3-bold text-main-heading dark:text-dark-text">
              Admins List
            </h2>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setStatusFilter(e.target.value);
                }}
                className="px-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary dark:focus:border-primary [&>option]:bg-white [&>option]:dark:bg-dark-bg [&>option]:dark:text-dark-text"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text/40" />
                <Input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sidebar-border dark:border-dark-border">
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Role
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Permissions
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Last Login
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4">
                    <Loader
                      size="md"
                      text="Loading admins..."
                      fullHeight={false}
                    />
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-dark-2 dark:text-dark-text/60"
                  >
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="border-b border-sidebar-border dark:border-dark-border"
                  >
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      <div>
                        <p className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-sm text-dark-2 dark:text-dark-text/60">
                          @{admin.userName}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {admin.email}
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text capitalize">
                      {admin.userType.replace("_", " ")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="grid grid-cols-2 gap-2">
                        {admin.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                          >
                            {getPermissionLabel(permission)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {admin.lastLogin ? formatDate(admin.lastLogin) : "Never"}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={admin.userStatus}
                        onChange={(e) =>
                          handleStatusChange(admin._id, e.target.value)
                        }
                        disabled={admin.userType === "super_admin"}
                        className={`px-3 py-1 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm ${
                          admin.userType === "super_admin"
                            ? "opacity-50 cursor-not-allowed"
                            : "text-paragraph dark:text-dark-text focus:outline-none focus:border-primary"
                        }`}
                      >
                        <option value="active" className="text-green-500">
                          Active
                        </option>
                        <option value="inactive" className="text-red-500">
                          Inactive
                        </option>
                      </select>
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
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        )}
      </div>

      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchAdmins();
        }}
      />
    </div>
  );
};

export default AdminsPage;
