"use client";

import { createContext, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Milestone {
  milestoneId: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  _id: string;
}

export interface Contract {
  _id: string;
  contractId: string;
  title: string;
  description: string;
  clientId: {
    _id: string;
    email: string;
    userName: string;
  };
  vendorId: {
    _id: string;
    email: string;
    userName: string;
  };
  contractFile: string[];
  budget: number;
  paymentType: string;
  milestones: Milestone[];
  status: string;
  substatus: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractContextType {
  contract: Contract | null;
  loading: boolean;
  fetchContract: (contractId: string) => Promise<void>;
}

const ContractContext = createContext<ContractContextType>({
  contract: null,
  loading: false,
  fetchContract: async () => {},
});

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchContract = async (contractId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/get-contract?contractId=${contractId}`
      );
      if (
        response.data.message === "Contract details retrieved successfully."
      ) {
        console.log("Contract details:", response.data.data);
        setContract(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to retrieve contract details.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching contract details.",
        variant: "warning",
      });
      setContract(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContractContext.Provider value={{ contract, loading, fetchContract }}>
      {children}
    </ContractContext.Provider>
  );
}

export const useContract = () => useContext(ContractContext);
