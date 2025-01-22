"use client";

import { createContext, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

interface ContractActionContextType {
  handleContractAction: (
    contractId: string, 
    action: "accept" | "reject", 
    shouldRedirect?: boolean,
    onActionComplete?: () => void
  ) => Promise<void>;
}

const ContractActionContext = createContext<ContractActionContextType>({
  handleContractAction: async () => {},
});

export function ContractActionProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const router = useRouter();
    
    const handleContractAction = async (
        contractId: string, 
        action: "accept" | "reject",
        shouldRedirect: boolean = false,
        onActionComplete?: () => void
    ) => {
      console.log(action,"action");
      try {
        await axios.patch("/api/handle-invite", {
          contractId,
          action,
        });
        
        toast({
          title: "Success",
          description: "Contract action successful.",
          variant: "default",
        });

        // Call the callback if provided
        if (onActionComplete) {
          onActionComplete();
        }

        if (shouldRedirect) {
          router.push("/home");
        } else if (action === "reject") {
          router.refresh(); // Force Next.js to refresh the current route
        } else {
          router.push(`/contact-details/${contractId}`);
        }
      } catch (error) {
        console.error("Error handling contract action:", error);
        toast({
          title: "Error",
          description: "An error occurred. Please try again.",
          variant: "warning",
        });
      }
    };

  return (
    <ContractActionContext.Provider value={{ handleContractAction }}>
      {children}
    </ContractActionContext.Provider>
  );
}

export const useContractAction = () => useContext(ContractActionContext); 