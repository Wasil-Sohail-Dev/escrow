import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { ContractFormData, contractSchema, validateDates, validatePayments } from "@/lib/validations/contract";
import { calculateThirdPartyFee } from "@/lib/helpers/calculateThirdPartyFee";

const defaultFormData: ContractFormData = {
  contractId: "",
  vendorEmail: "",
  title: "",
  startDate: "",
  endDate: "",
  description: "",
  paymentType: "fixed",
  contractType: "services",
  totalPayment: "",
  isSelected: false,
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
  contractTemplate: "kitchen-design",
};

export const useContractForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContractFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [vendorEmailError, setVendorEmailError] = useState("");
  const [isVendorValid, setIsVendorValid] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [contractDateError, setContractDateError] = useState("");
  const [milestoneDateErrors, setMilestoneDateErrors] = useState<string[]>([]);
  const [inviteContractId, setInviteContractId] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [milestoneErrors, setMilestoneErrors] = useState<Array<{[key: string]: string}>>([]);
  const [thirdPartyFee, setThirdPartyFee] = useState({ fee: 0, percentage: 0 });

console.log(formData,"formData");

  // Initialize contract ID
  useEffect(() => {
    const initiateContract = async () => {
      try {
        const { data } = await axios.get("/api/initiate-contract");
        if (data) {
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

  // Check vendor email
  useEffect(() => {
    const checkEmail = async () => {
      setVendorEmailError("");

      if (!formData.vendorEmail || !formData.vendorEmail.includes(".com")) return;

      try {
        const { data } = await axios.get(
          `/api/check-vendor-mail?vendorEmail=${formData.vendorEmail}`
        );
        if (data.message === "Vendor email is valid.") {
          setIsVendorValid(true);
        }
      } catch (error: any) {
        setIsVendorValid(false);
        if (error.response?.data?.error) {
          setVendorEmailError(error.response.data.error);
        } else {
          setVendorEmailError("Error checking vendor email");
        }
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.vendorEmail]);

  // Load saved form data
  useEffect(() => {
    const savedFormData = sessionStorage.getItem("contractFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        const amount = parseFloat(parsedData.totalPayment);
        const fee = calculateThirdPartyFee(amount, parsedData?.contractType || "services" );
        setThirdPartyFee(fee);
        sessionStorage.removeItem("contractFormData");

      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  // Validate payments whenever total payment or milestones change
  useEffect(() => {
    const { error } = validatePayments(formData.totalPayment, formData.milestones);
    setPaymentError(error);
  }, [formData.totalPayment, formData.milestones]);

  const validateField = async (field: string, value: any) => {
    try {
      if (field.includes('milestone')) {
        const [index, subField] = field.split('.');
        const milestoneIndex = parseInt(index.replace('milestone', ''));
        const milestoneData = { [subField]: value };
        const pickObject = { [subField]: true } as { [K in keyof (typeof contractSchema)['shape']]: true };
        await contractSchema.shape.milestones.element.pick(pickObject as any).parseAsync(milestoneData);
        setMilestoneErrors(prev => {
          const newErrors = [...prev];

          if (!newErrors[milestoneIndex]) newErrors[milestoneIndex] = {};
          newErrors[milestoneIndex][subField] = '';
          return newErrors;
        });
      } else {
        const pickObject = { [field]: true } as { [K in keyof ContractFormData]: true };
        await contractSchema.pick(pickObject).parseAsync({ [field]: value });
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch (error: any) {
      if (field.includes('milestone')) {
        const [index, subField] = field.split('.');
        const milestoneIndex = parseInt(index.replace('milestone', ''));
        setMilestoneErrors(prev => {
          const newErrors = [...prev];
          if (!newErrors[milestoneIndex]) newErrors[milestoneIndex] = {};
          newErrors[milestoneIndex][subField] = error.errors[0]?.message || 'Invalid value';
          return newErrors;
        });
      } else {
        setFieldErrors(prev => ({
          ...prev,
          [field]: error.errors[0]?.message || 'Invalid value'
        }));
      }
    }
  };

  const handleInputChange = (field: keyof ContractFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Calculate Third Party fee when totalPayment changes
    if (field === "totalPayment" && !isNaN(parseFloat(value))) {
      const amount = parseFloat(value);
      const fee = calculateThirdPartyFee(amount, formData.contractType);
      setThirdPartyFee(fee);
    }

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

  const handleBlur = (field: string) => {
    if (field.includes('milestone')) {
      const [index, subField] = field.split('.');
      const milestoneIndex = parseInt(index.replace('milestone', ''));
      validateField(field, formData.milestones[milestoneIndex][subField as keyof typeof formData.milestones[0]]);
    } else {
      validateField(field, formData[field as keyof ContractFormData]);
    }
  };

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setFormData((prev) => ({ ...prev, milestones: newMilestones }));

    if (field === "startDate" || field === "endDate") {
      const start = field === "startDate" ? value : newMilestones[index].startDate;
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
      setFormData((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), ...Array.from(files)] as File[],
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setVendorEmailError("");
    setIsVendorValid(false);
    setPaymentError("");
    setContractDateError("");
    setMilestoneDateErrors([]);
  };

  const validateForm = async () => {
    try {
      await contractSchema.parseAsync(formData);
      return true;
    } catch (error: any) {
      const errors = error.errors || [];
      errors.forEach((err: any) => {
        toast({
          title: "Validation Error",
          description: err.message,
          variant: "destructive",
        });
      });
      return false;
    }
  };

  const onSubmit = async () => {
    if (!await validateForm()) return;

    if (!isVendorValid) {
      toast({
        title: "Invalid vendor",
        description: "Please enter a valid vendor email",
        variant: "destructive",
      });
      return;
    }

    const { isValid, error } = validatePayments(formData.totalPayment, formData.milestones);
    if (!isValid) {
      toast({
        title: "Invalid payments",
        description: error,
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
      (milestone) => !validateDates(milestone.startDate, milestone.endDate)
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
      // Create form data
      const formDataToSend = new FormData();
      
      // Add JSON data
      const jsonData = {
        ...formData,
        contractType: formData.contractType === "services" ? "services" : "products",
        clientEmail: user?.email,
        budget: parseFloat(formData.totalPayment),
        milestones: formData.milestones.map((m) => ({
          title: m.name,
          amount: parseFloat(m.amount),
          description: m.description,
          startDate: new Date(m.startDate).toISOString().split('T')[0] + 'T00:00:00.000Z',
          endDate: new Date(m.endDate).toISOString().split('T')[0] + 'T00:00:00.000Z',
        })),
        startDate: new Date(formData.startDate).toISOString().split('T')[0] + 'T00:00:00.000Z',
        endDate: new Date(formData.endDate).toISOString().split('T')[0] + 'T00:00:00.000Z',
      };
      formDataToSend.append('data', JSON.stringify(jsonData));
      // Add files if they exist
      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach((file: File) => {
          formDataToSend.append('contractFiles', file);
        });
      }

      const response = await fetch("/api/create-contract", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        setInviteContractId(data?.data?.contractId);
        sessionStorage.removeItem("contractFormData");
        setIsSuccessModalOpen(true);
        resetForm();
        const { data: newContractData } = await axios.get("/api/initiate-contract");
        if (newContractData) {
          setFormData((prev) => ({
            ...prev,
            contractId: newContractData.contractId,
          }));
        }
      } else {
        throw new Error(data.error || "Failed to create contract");
      }
    } catch (error: any) {
      console.error("Error creating contract:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create contract",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveFormDataToSession = () => {
    sessionStorage.setItem("contractFormData", JSON.stringify(formData));
  };


  return {
    formData,
    isLoading,
    vendorEmailError,
    isVendorValid,
    paymentError,
    contractDateError,
    milestoneDateErrors,
    inviteContractId,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    handleInputChange,
    handleMilestoneChange,
    addNewMilestone,
    handleFileUpload,
    handleRemoveFile,
    onSubmit,
    saveFormDataToSession,
    handleBlur,
    fieldErrors,
    milestoneErrors,
    thirdPartyFee,
  };
}; 