"use client";

import React, { useEffect, useState } from "react";
import Topbar from "../../../components/dashboard/Topbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ContractSuccessModal from "@/components/modals/ContractSuccessModal";

interface FormErrors {
  title?: string;
  description?: string;
  vendorEmail?: string;
  totalPayment?: string;
  startDate?: string;
  endDate?: string;
  milestones?: {
    name?: string;
    description?: string;
    amount?: string;
    startDate?: string;
    endDate?: string;
  }[];
}

const CreateContract = () => {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contractId: "",
    vendorEmail: "",
    title: "",
    startDate: "",
    endDate: "",
    description: "",
    paymentType: "fixed",
    totalPayment: "",
    milestones: [
      {
        name: "",
        amount: "",
        description: "",
        startDate: "",
        endDate: "",
      },
    ],
    documents: [],
  });

  const [vendorEmailError, setVendorEmailError] = useState("");
  const [isVendorValid, setIsVendorValid] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [contractDateError, setContractDateError] = useState("");
  const [milestoneDateErrors, setMilestoneDateErrors] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initiateContract = async () => {
      try {
        const { data } = await axios.get("/api/initiate-contract");
        if (data) {
          console.log(data.contractId, "datadata");
          setFormData((prev) => ({
            ...prev,
            contractId: data.contractId,
          }));
        }
      } catch (error) {
        console.error("Error initiating contract:", error);
      }
    };

    initiateContract();
  }, []);

  useEffect(() => {
    const checkEmail = async () => {
      setVendorEmailError("");

      if (!formData.vendorEmail || !formData.vendorEmail.includes(".com"))
        return;

      try {
        const { data } = await axios.get(
          `/api/check-vendor-mail?vendorEmail=${formData.vendorEmail}`
        );
        if (data.message === "Vendor email is valid.") {
          setIsVendorValid(true);
          // if (!sessionStorage.getItem('contractFormData')) {
          //   toast({
          //     title: "Valid vendor email",
          //     description: "The vendor email is valid",
          //     variant: "default",
          //   });
          // }
        }
      } catch (error: any) {
        setIsVendorValid(false);
        if (error.response?.data?.error) {
          setVendorEmailError(error.response.data.error);
          // toast({
          //   title: "Invalid vendor email",
          //   description: error.response.data.error,
          //   variant: "destructive",
          // });
        } else {
          setVendorEmailError("Error checking vendor email");
        }
      }
    };

    const timeoutId = setTimeout(() => {
      checkEmail();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.vendorEmail]);

  const [selectedTemplate, setSelectedTemplate] = useState("kitchen-design");

  const templates = [
    { id: "kitchen-design", label: "Kitchen Design" },
    { id: "graphic-design", label: "Graphic Design" },
    { id: "home-renovation", label: "Home Renovation" },
    { id: "it-support", label: "IT Support" },
    { id: "website-development", label: "Website Development" },
    { id: "product-delivery", label: "Product Delivery" },
  ];

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "title":
        if (!value.trim()) return "Contract title is required";
        if (value.length < 3) return "Title must be at least 3 characters";
        return "";
      case "description":
        if (!value.trim()) return "Contract description is required";
        if (value.length < 10)
          return "Description must be at least 10 characters";
        return "";
      case "vendorEmail":
        if (!value.trim()) return "Vendor email is required";
        if (!value.includes("@") || !value.includes("."))
          return "Invalid email format";
        return "";
      case "totalPayment":
        if (!value.trim()) return "Total payment is required";
        if (isNaN(parseFloat(value)) || parseFloat(value) <= 0)
          return "Invalid payment amount";
        if (!Number.isInteger(parseFloat(value)))
          return "Payment amount must be a whole number";
        return "";
      case "milestone_name":
        if (!value.trim()) return "Milestone name is required";
        if (value.length < 3)
          return "Milestone name must be at least 3 characters";
        return "";
      case "milestone_amount":
        if (!value.trim()) return "Milestone amount is required";
        if (isNaN(parseFloat(value)) || parseFloat(value) <= 0)
          return "Invalid milestone amount";
        if (!Number.isInteger(parseFloat(value)))
          return "Milestone amount must be a whole number";
        return "";
      case "milestone_description":
        if (!value.trim()) return "Milestone description is required";
        if (value.length < 10)
          return "Milestone description must be at least 10 characters";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));

    if (field === "startDate" || field === "endDate") {
      const start = field === "startDate" ? value : formData.startDate;
      const end = field === "endDate" ? value : formData.endDate;

      if (start && end && !validateDates(start, end)) {
        setContractDateError("Start date must be before end date");
      } else {
        setContractDateError("");
      }
    }
  };

  const handleMilestoneChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setFormData((prev) => ({ ...prev, milestones: newMilestones }));

    const error = validateField(`milestone_${field}`, value);
    setErrors((prev) => ({
      ...prev,
      milestones:
        prev.milestones?.map((milestone, i) =>
          i === index ? { ...milestone, [field]: error } : milestone
        ) || [],
    }));

    if (field === "startDate" || field === "endDate") {
      const start =
        field === "startDate" ? value : newMilestones[index].startDate;
      const end = field === "endDate" ? value : newMilestones[index].endDate;

      setMilestoneDateErrors((prev) => {
        const newErrors = [...prev];
        if (start && end && !validateDates(start, end)) {
          newErrors[index] = "Start date must be before end date";
        } else {
          newErrors[index] = "";
        }
        return newErrors;
      });
    }
  };

  const addNewMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          name: "",
          amount: "",
          description: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev: any) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
    }
  };

  const validatePayments = () => {
    const totalProjectPayment = parseFloat(formData.totalPayment) || 0;
    const milestoneTotalAmount = formData.milestones.reduce(
      (sum, milestone) => sum + (parseFloat(milestone.amount) || 0),
      0
    );

    if (totalProjectPayment !== milestoneTotalAmount) {
      setPaymentError(
        `Total milestone amounts (${milestoneTotalAmount}) must equal total project payment (${totalProjectPayment})`
      );
      return false;
    }

    setPaymentError("");
    return true;
  };

  const validateDates = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) < new Date(endDate);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      title: validateField("title", formData.title),
      description: validateField("description", formData.description),
      vendorEmail: validateField("vendorEmail", formData.vendorEmail),
      totalPayment: validateField("totalPayment", formData.totalPayment),
      startDate: formData.startDate ? "" : "Start date is required",
      endDate: formData.endDate ? "" : "End date is required",
      milestones: formData.milestones.map((milestone) => ({
        name: validateField("milestone_name", milestone.name),
        description: validateField(
          "milestone_description",
          milestone.description
        ),
        amount: validateField("milestone_amount", milestone.amount),
        startDate: milestone.startDate ? "" : "Start date is required",
        endDate: milestone.endDate ? "" : "End date is required",
      })),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => {
      if (typeof error === "string") return error !== "";
      if (Array.isArray(error)) {
        return error.some((milestoneError) =>
          Object.values(milestoneError).some((e) => e !== "")
        );
      }
      return Object.values(error).some((e) => e !== "");
    });

    return !hasErrors;
  };

  const resetForm = () => {
    setFormData({
      contractId: "",
      vendorEmail: "",
      title: "",
      startDate: "",
      endDate: "",
      description: "",
      paymentType: "fixed",
      totalPayment: "",
      milestones: [
        {
          name: "",
          amount: "",
          description: "",
          startDate: "",
          endDate: "",
        },
      ],
      documents: [],
    });
    setVendorEmailError("");
    setIsVendorValid(false);
    setPaymentError("");
    setContractDateError("");
    setMilestoneDateErrors([]);
    setErrors({});
  };

  const onSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again",
        variant: "destructive",
      });
      return;
    }

    if (!isVendorValid) {
      toast({
        title: "Invalid vendor",
        description: "Please enter a valid vendor email",
        variant: "destructive",
      });
      return;
    }

    if (!validatePayments()) {
      toast({
        title: "Invalid payments",
        description: paymentError,
        variant: "destructive",
      });
      return;
    }

    if (!validateDates(formData.startDate, formData.endDate)) {
      toast({
        title: "Invalid dates",
        description: "Contract start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    const invalidMilestones = formData.milestones.some(
      (milestone, index) =>
        !validateDates(milestone.startDate, milestone.endDate)
    );

    if (invalidMilestones) {
      toast({
        title: "Invalid milestone dates",
        description: "All milestone start dates must be before their end dates",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/create-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientEmail: user?.email,
          budget: parseFloat(formData.totalPayment),
          milestones: formData.milestones.map((m: any) => ({
            title: m.name,
            amount: parseFloat(m.amount),
            description: m.description,
            startDate: new Date(m.startDate).toISOString(),
            endDate: new Date(m.endDate).toISOString(),
          })),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          contractTemplate: selectedTemplate,
        }),
      });

      if (response.ok) {
        sessionStorage.removeItem("contractFormData");
        resetForm();
        setIsSuccessModalOpen(true);
        const { data } = await axios.get("/api/initiate-contract");
        if (data) {
          setFormData((prev) => ({
            ...prev,
            contractId: data.contractId,
          }));
        }
      } else {
        toast({
          title: "Warning",
          description: "Please try again",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Warning",
        description: "Please try again",
        variant: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validatePayments();
  }, [formData.totalPayment, formData.milestones]);

  // Add useEffect to load saved form data
  useEffect(() => {
    const savedFormData = sessionStorage.getItem("contractFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        console.log(parsedData,"parsedDataparsedData");
        
        setSelectedTemplate(parsedData.id);
        setFormData(parsedData);
        // Clear the saved data after loading
        sessionStorage.removeItem("contractFormData");
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  const showPreview = () => {
    // Store form data in sessionStorage before navigating
    sessionStorage.setItem("contractFormData", JSON.stringify(formData));
    router.push("/pre-build-details");
  };

  return (
    <>
      <Topbar
        title="Create Your Contract"
        description="Add the following details in order to create your contract"
      />
      <div className="mt-[85px]">
        <div className="w-full">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-[22px] lg:text-[24px] font-bold mb-2 text-[#292929] dark:text-dark-text">
              Create Contract
            </h1>
            <Button
              onClick={() => router.push("/pre-build-contracts")}
              className="h-[38px] lg:h-[42px] bg-primary hover:bg-primary/90 text-white dark:text-dark-text"
            >
              Use Pre-build Templates
            </Button>
          </div>

          {/* <div className="mb-8 flex md:justify-between flex-col md:flex-row items-center border-y border-[#D0D0D0] dark:border-dark-border py-8">
            <h1 className="text-[22px] lg:text-[22px] font-[500] leading-[30px] mb-2 text-[#292929] dark:text-dark-text">
              Contract Template
            </h1>
            <div>
              <div className="flex flex-row sm:gap-10 gap-4">
                {templates
                  .reduce((acc: JSX.Element[][], template, i) => {
                    if (i % 2 === 0) acc.push([]);
                    acc[acc.length - 1].push(
                      <div
                        key={template.id}
                        className="flex sm:items-center items-start space-x-2"
                      >
                        <Checkbox
                          id={template.id}
                          checked={selectedTemplate === template.id}
                          onCheckedChange={() =>
                            setSelectedTemplate(template.id)
                          }
                          className={`${
                            selectedTemplate === template.id
                              ? "border-[#00BA88] data-[state=checked]:bg-[#00BA88] data-[state=checked]:border-[#00BA88]"
                              : "border-[#E8EAEE]"
                          } rounded-full`}
                        />
                        <label
                          htmlFor={template.id}
                          className="sm:text-[16px] text-sm font-[400] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#64748B] dark:text-dark-text/60"
                        >
                          {template.label}
                        </label>
                      </div>
                    );
                    return acc;
                  }, [])
                  .map((column, i) => (
                    <div key={i} className="flex flex-col gap-4">
                      {column}
                    </div>
                  ))}
              </div>
            </div>
          </div> */}

          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Contract ID
                </label>
                <Input
                  type="text"
                  disabled
                  value={formData.contractId}
                  onChange={(e) =>
                    handleInputChange("contractId", e.target.value)
                  }
                  placeholder="Enter contract ID"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Vendor Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={formData.vendorEmail}
                    onChange={(e) =>
                      handleInputChange("vendorEmail", e.target.value)
                    }
                    placeholder="Enter vendor email"
                    className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                      vendorEmailError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : isVendorValid
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "border-[#D1D5DB] dark:border-dark-border"
                    } rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                  />
                  {isVendorValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="text-[#00BA88]" />
                    </div>
                  )}
                </div>
                {vendorEmailError && (
                  <p className="text-sm text-red-500 mt-1">
                    {vendorEmailError}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Contract Title
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="eg. Graphic Design"
                className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                  errors.title
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-[#D1D5DB]"
                } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2 flex flex-col">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Start Date
                </label>
                <DatePicker
                  selected={
                    formData.startDate
                      ? new Date(formData.startDate + "T00:00:00")
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      handleInputChange("startDate", `${year}-${month}-${day}`);
                    } else {
                      handleInputChange("startDate", "");
                    }
                  }}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select start date"
                  className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                    contractDateError ? "border-red-500" : "border-[#D1D5DB]"
                  } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                  minDate={new Date()}
                />
              </div>

              <div className="space-y-2  flex flex-col">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  End Date
                </label>
                <DatePicker
                  selected={
                    formData.endDate
                      ? new Date(formData.endDate + "T00:00:00")
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      handleInputChange("endDate", `${year}-${month}-${day}`);
                    } else {
                      handleInputChange("endDate", "");
                    }
                  }}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select end date"
                  className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                    contractDateError ? "border-red-500" : "border-[#D1D5DB]"
                  } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                  minDate={
                    formData.startDate
                      ? new Date(formData.startDate + "T00:00:00")
                      : new Date()
                  }
                />
                {contractDateError && (
                  <div className="col-span-full">
                    <p className="text-sm text-red-500">{contractDateError}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Contract Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="eg. It includes..."
                className="min-h-[120px] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-0 border-t border-[#D0D0D0] dark:border-dark-border pt-8">
              <label className="text-[15px] lg:text-[22px] text-[#292929] dark:text-dark-text font-[500]">
                Payment Terms
              </label>
              <div className="flex gap-8 ml-10">
                {["hourly", "fixed"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.paymentType === type}
                      onCheckedChange={() =>
                        handleInputChange("paymentType", type)
                      }
                      className="border-[#E8EAEE] rounded-full"
                    />
                    <label
                      htmlFor={type}
                      className="text-[14px] text-[#292929] dark:text-dark-text"
                    >
                      {type === "hourly" ? "Hourly" : "Fixed Price"}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
              <div className="space-y-2 flex-1">
                <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                  Total Project Payment
                </label>
                <Input
                  type="text"
                  value={formData.totalPayment}
                  onChange={(e) =>
                    handleInputChange("totalPayment", e.target.value)
                  }
                  placeholder="$2500"
                  className="h-[48px] lg:h-[52px] dark:bg-dark-input-bg border border-[#D1D5DB] dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                />
              </div>
              <div className="md:block hidden flex-1"></div>
            </div>

            <div className="">
              <div
                className="flex justify-between items-center mb-6 cursor-pointer"
                onClick={addNewMilestone}
              >
                <h2 className="text-body-medium text-primary text-[15px] flex items-center">
                  <Plus className="mr-2" /> Add New Milestone
                </h2>
              </div>

              {formData.milestones.map((milestone, index) => (
                <div key={index} className="space-y-6">
                  <h2 className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold mt-5">
                    Milestone No ({index + 1})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Milestone Name
                      </label>
                      <Input
                        type="text"
                        value={milestone.name}
                        onChange={(e) =>
                          handleMilestoneChange(index, "name", e.target.value)
                        }
                        placeholder="eg. Floor Planning"
                        className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          errors.milestones?.[index]?.name
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                      />
                      {errors.milestones?.[index]?.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.milestones?.[index]?.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Milestone Amount
                      </label>
                      <Input
                        type="text"
                        value={milestone.amount}
                        onChange={(e) =>
                          handleMilestoneChange(index, "amount", e.target.value)
                        }
                        placeholder="$500"
                        className={`h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          errors.milestones?.[index]?.amount
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                      />
                      {paymentError && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                      Milestone Description
                    </label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) =>
                        handleMilestoneChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="eg. The Graphic Design process..."
                      className={`min-h-[120px] dark:bg-dark-input-bg border ${
                        errors.milestones?.[index]?.description
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-[#D1D5DB]"
                      } dark:border-dark-border rounded-lg text-[16px] lg:text-[16px] font-[400] leading-[19.5px] text-[#292929] dark:text-dark-text placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40`}
                    />
                    {errors.milestones?.[index]?.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.milestones?.[index]?.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-20">
                    <div className="space-y-2  flex flex-col">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        Start Date
                      </label>
                      <DatePicker
                        selected={
                          milestone.startDate
                            ? new Date(milestone.startDate + "T00:00:00")
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            handleMilestoneChange(
                              index,
                              "startDate",
                              `${year}-${month}-${day}`
                            );
                          } else {
                            handleMilestoneChange(index, "startDate", "");
                          }
                        }}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="Select start date"
                        className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          milestoneDateErrors[index]
                            ? "border-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                        minDate={new Date(formData.startDate)}
                        maxDate={new Date(formData.endDate)}
                      />
                    </div>

                    <div className="space-y-2  flex flex-col">
                      <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                        End Date
                      </label>
                      <DatePicker
                        selected={
                          milestone.endDate
                            ? new Date(milestone.endDate + "T00:00:00")
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            handleMilestoneChange(
                              index,
                              "endDate",
                              `${year}-${month}-${day}`
                            );
                          } else {
                            handleMilestoneChange(index, "endDate", "");
                          }
                        }}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="Select end date"
                        className={`w-full h-[48px] lg:h-[52px] dark:bg-dark-input-bg border ${
                          milestoneDateErrors[index]
                            ? "border-red-500"
                            : "border-[#D1D5DB]"
                        } dark:border-dark-border rounded-lg px-3 dark:placeholder:text-dark-text/40 dark:text-dark-text`}
                        minDate={
                          milestone.startDate
                            ? new Date(milestone.startDate + "T00:00:00")
                            : new Date(formData.startDate)
                        }
                        maxDate={new Date(formData.endDate)}
                      />
                      {milestoneDateErrors[index] && (
                        <div className="col-span-full">
                          <p className="text-sm text-red-500">
                            {milestoneDateErrors[index]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[15px] md:text-body-medium text-[#292929] dark:text-dark-text font-semibold">
                Upload Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-[#CACED8] dark:border-dark-border rounded-lg p-6 md:p-8 text-center cursor-pointer dark:bg-dark-input-bg hover:border-primary dark:hover:border-primary transition-colors">
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                  multiple
                />
                <label
                  htmlFor="file-upload"
                  className="w-full h-full cursor-pointer"
                >
                  <div className="flex justify-center mb-2">
                    <Image
                      src={"/assets/download2.svg"}
                      alt="upload"
                      width={40}
                      height={30}
                    />
                  </div>
                  <p className="text-subtle-medium text-[#64748B] dark:text-dark-text/60">
                    Drag and drop file here or{" "}
                    <span className="text-primary text-[12px] font-[700] leading-[18px]">
                      browse file
                    </span>
                  </p>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
          <Button
            onClick={showPreview}
            className="w-full sm:w-auto h-[42px] px-6 md:px-10 border bg-transparent text-[#292929] border-primary hover:text-primary hover:bg-transparent rounded-lg transition-colors dark:text-dark-text dark:hover:text-primary dark:bg-dark-input-bg"
            disabled={
              !formData.title ||
              !formData.startDate ||
              !formData.endDate ||
              !formData.description ||
              !formData.paymentType ||
              !formData.totalPayment ||
              !formData.milestones.every(
                (milestone) =>
                  milestone.name &&
                  milestone.amount &&
                  milestone.description &&
                  milestone.startDate &&
                  milestone.endDate
              )
            }
          >
            Preview
          </Button>
          <Button
            onClick={onSubmit}
            className="w-full sm:w-auto h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-[16px] font-[700] leading-[19.6px] text-white dark:text-dark-text rounded-lg transition-colors"
            disabled={
              isLoading ||
              !formData.title ||
              !formData.startDate ||
              !formData.endDate ||
              !formData.description ||
              !formData.paymentType ||
              !formData.totalPayment ||
              !formData.milestones.every(
                (milestone) =>
                  milestone.name &&
                  milestone.amount &&
                  milestone.description &&
                  milestone.startDate &&
                  milestone.endDate
              )
            }
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      <ContractSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        contractId={formData.contractId}
      />
    </>
  );
};

export default CreateContract;
