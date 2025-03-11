"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";
import Loader from "@/components/ui/loader";
import { formatDate } from "@/lib/helpers/fromatDate";
import CreatePromotionCodeModal from "@/components/modals/CreatePromotionCodeModal";

interface PromotionCode {
  _id: string;
  code: string;
  discountPercentage: number;
  reason: string;
  status: string;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  createdBy: {
    userName: string;
    email: string;
  };
  createdAt: string;
}

const PromotionCodePage = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<PromotionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    reason: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/generate-code?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}&search=${searchTerm}`
      );
      const data = await response.json();

      if (data.success) {
        setCodes(data.data);
        setTotalItems(data.pagination.total);
      } else {
        throw new Error(data.error || "Failed to fetch promotion codes");
      }
    } catch (error) {
      console.error("Error fetching promotion codes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch promotion codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [currentPage, statusFilter, searchTerm]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (
      !formData.code ||
      !/^[A-Z0-9]{4,6}$/.test(formData.code.toUpperCase())
    ) {
      errors.code =
        "Code must be 4-6 characters long and contain only letters and numbers";
    }

    const discountValue = Number(formData.discountPercentage);
    if (
      !formData.discountPercentage ||
      isNaN(discountValue) ||
      discountValue < 1 ||
      discountValue > 100
    ) {
      errors.discountPercentage = "Discount must be between 1 and 100";
    }

    if (!formData.reason.trim()) {
      errors.reason = "Reason is required";
    }

    if (!formData.validFrom) {
      errors.validFrom = "Start date is required";
    }

    if (!formData.validUntil) {
      errors.validUntil = "End date is required";
    }

    if (new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      errors.validUntil = "End date must be after start date";
    }

    const usageLimitValue = Number(formData.usageLimit);
    if (!formData.usageLimit || isNaN(usageLimitValue) || usageLimitValue < 1) {
      errors.usageLimit = "Usage limit must be at least 1";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCode = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          discountPercentage: Number(formData.discountPercentage),
          usageLimit: Number(formData.usageLimit),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Promotion code created successfully",
        });
        setIsCreateDialogOpen(false);
        setFormData({
          code: "",
          discountPercentage: "",
          reason: "",
          validFrom: "",
          validUntil: "",
          usageLimit: "",
        });
        fetchCodes();
      } else {
        throw new Error(data.error || "Failed to create promotion code");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create promotion code",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/generate-code", {
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
          description: "Status updated successfully",
        });
        fetchCodes();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-main-heading dark:text-dark-text">
          Promotion Codes
        </h1>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
        <div className="p-6 border-b border-sidebar-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <h2 className="text-heading3-bold text-main-heading dark:text-dark-text">
              Promotion Codes List
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
                <option value="expired">Expired</option>
              </select>
              <Input
                type="text"
                placeholder="Search codes..."
                value={searchTerm}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
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
                  Code
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Discount
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Reason
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Valid Period
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Usage
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-base-medium text-dark-2 dark:text-dark-text">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-4">
                    <Loader
                      size="md"
                      text="Loading codes..."
                      fullHeight={false}
                    />
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-dark-2 dark:text-dark-text/60"
                  >
                    No promotion codes found
                  </td>
                </tr>
              ) : (
                codes.map((code) => (
                  <tr
                    key={code._id}
                    className="border-b border-sidebar-border dark:border-dark-border"
                  >
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text font-medium">
                      {code.code}
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {code.discountPercentage}%
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {code.reason.length > 20
                        ? code.reason.slice(0, 20) + "..."
                        : code.reason}
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {formatDate(code.validFrom)} -{" "}
                      {formatDate(code.validUntil)}
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {code.usageCount} / {code.usageLimit}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={code.status}
                        onChange={(e) =>
                          handleStatusChange(code._id, e.target.value)
                        }
                        className="px-3 py-1 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary"
                      >
                        <option value="active" className="text-green-500">
                          Active
                        </option>
                        <option value="inactive" className="text-red-500">
                          Inactive
                        </option>
                        <option value="expired" className="text-red-500">
                          Expired
                        </option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-base-regular text-paragraph dark:text-dark-text">
                      {code.createdBy.userName}
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

      <CreatePromotionCodeModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        formData={formData}
        formErrors={formErrors}
        onSubmit={handleCreateCode}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default PromotionCodePage;
