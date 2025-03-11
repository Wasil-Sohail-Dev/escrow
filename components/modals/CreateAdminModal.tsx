"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PERMISSIONS = [
  { value: "manage_users", label: "Manage Users" },
  { value: "manage_payments", label: "Manage Payments" },
  { value: "manage_disputes", label: "Manage Disputes" },
  { value: "manage_contracts", label: "Manage Contracts" },
  { value: "manage_admins", label: "Manage Admins" },
  { value: "view_analytics", label: "View Analytics" },
];

const CreateAdminModal = ({ isOpen, onClose, onSuccess }: CreateAdminModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    userType: "admin",
    permissions: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = "Please select at least one permission";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin-auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin created successfully",
        });
        onSuccess();
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          password: "",
          userType: "admin",
          permissions: [],
        });
      } else {
        throw new Error(data.error || "Failed to create admin");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: "" }));
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[600px] px-4 md:px-6 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[20px] sm:text-[24px] font-semibold dark:text-dark-text border-b border-[#E3E3E3] w-full dark:border-dark-border pb-4">
            Add New Admin
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500 dark:text-dark-text dark:bg-dark-input-bg" : "dark:text-dark-text dark:bg-dark-input-bg"}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500 dark:text-dark-text dark:bg-dark-input-bg" : "dark:text-dark-text dark:bg-dark-input-bg"}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              placeholder="Username"
              value={formData.userName}
              onChange={(e) => handleInputChange("userName", e.target.value)}
              className={errors.userName ? "border-red-500 dark:text-dark-text dark:bg-dark-input-bg" : "dark:text-dark-text dark:bg-dark-input-bg"}
            />
            {errors.userName && (
              <p className="text-sm text-red-500 mt-1">{errors.userName}</p>
            )}
          </div>

          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500 dark:text-dark-text dark:bg-dark-input-bg" : "dark:text-dark-text dark:bg-dark-input-bg"}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={errors.password ? "border-red-500 dark:text-dark-text dark:bg-dark-input-bg" : "dark:text-dark-text dark:bg-dark-input-bg"}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-paragraph dark:text-dark-text mb-2 block">
              Role
            </label>
            <select
              value={formData.userType}
              onChange={(e) => handleInputChange("userType", e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text"
            >
              <option value="admin" className="dark:text-black">Admin</option>
              <option value="moderator" className="dark:text-black">Moderator</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-paragraph dark:text-dark-text mb-2 block">
              Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PERMISSIONS.map((permission) => (
                <div key={permission.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.value}
                    checked={formData.permissions.includes(permission.value)}
                    onCheckedChange={() => togglePermission(permission.value)}
                  />
                  <label
                    htmlFor={permission.value}
                    className="text-sm text-paragraph dark:text-dark-text cursor-pointer"
                  >
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.permissions && (
              <p className="text-sm text-red-500 mt-1">{errors.permissions}</p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-11"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              "Create Admin"
            )}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default CreateAdminModal; 