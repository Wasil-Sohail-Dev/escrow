"use client";

import { UserProvider } from "@/contexts/UserContext";
import { ContractActionProvider } from "@/contexts/ContractActionContext";
import { ContractProvider } from "@/contexts/ContractContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ContractProvider>
        <ContractActionProvider>
          {children}
        </ContractActionProvider>
      </ContractProvider>
    </UserProvider>
  );
} 