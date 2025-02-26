import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { formatDate } from "@/lib/helpers/fromatDate";
import { getStatusColor } from "@/lib/helpers/getStatusColor";

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    _id: string;
    firstName?: string;
    lastName?: string;
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
  } | null;
}

const CustomerDetailsModal = ({
  isOpen,
  onClose,
  customer,
}: CustomerDetailsModalProps) => {
  if (!customer) return null;



  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[700px] px-4 md:px-6 rounded-lg overflow-hidden">
        <ModalHeader>
          <ModalTitle className="text-[20px] sm:text-[24px] font-semibold dark:text-dark-text border-b border-[#E3E3E3] dark:border-dark-border pb-4">
            Customer Details
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-6 p-4 h-[500px] overflow-y-auto scrollbar-hide overflow-hidden">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white dark:text-dark-text text-xl">
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
                <h3 className="text-xl font-semibold text-paragraph dark:text-dark-text">
                  {customer.firstName} {customer.lastName}
                </h3>
                <p className="text-gray-500 dark:text-dark-text/60">
                  {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-gray-500 dark:text-dark-text/60">
                    {customer.phone}
                  </p>
                )}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                customer.userStatus
              )}`}
            >
              {customer.userStatus}
            </span>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
              <p className="text-sm text-gray-500 dark:text-dark-text/60">
                Username
              </p>
              <p className="font-medium text-paragraph dark:text-dark-text">
                {customer.userName || "Not set"}
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
              <p className="text-sm text-gray-500 dark:text-dark-text/60">
                Account Type
              </p>
              <p className="font-medium text-paragraph dark:text-dark-text capitalize">
                {customer.userType}
              </p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="rounded-lg border border-[#E3E3E3] dark:border-dark-border p-4 space-y-4">
            <h4 className="text-lg font-semibold text-paragraph dark:text-dark-text">
              Projects Overview
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">
                  Active Projects
                </p>
                <p className="text-xl font-semibold text-paragraph dark:text-dark-text">
                  {customer.projects.active}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">
                  Completed Projects
                </p>
                <p className="text-xl font-semibold text-paragraph dark:text-dark-text">
                  {customer.projects.completed}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="rounded-lg border border-[#E3E3E3] dark:border-dark-border p-4 space-y-4">
            <h4 className="text-lg font-semibold text-paragraph dark:text-dark-text">
              Revenue Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">
                  Current Month Revenue
                </p>
                <p className="text-xl font-semibold text-paragraph dark:text-dark-text">
                  ${customer.revenue.current.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">
                  Revenue Growth
                </p>
                <p
                  className={`text-xl font-semibold ${
                    customer.revenue.growth >= 0
                      ? "text-success-text"
                      : "text-error-text"
                  }`}
                >
                  {customer.revenue.growth >= 0 ? "+" : ""}
                  {customer.revenue.growth}%
                </p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
              <p className="text-sm text-gray-500 dark:text-dark-text/60">
                Member Since
              </p>
              <p className="font-medium text-paragraph dark:text-dark-text">
                {formatDate(customer.createdAt)}
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
              <p className="text-sm text-gray-500 dark:text-dark-text/60">
                Customer ID
              </p>
              <p className="font-medium text-paragraph dark:text-dark-text font-mono">
                {customer._id}
              </p>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default CustomerDetailsModal; 