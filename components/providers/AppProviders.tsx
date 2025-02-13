"use client";

import { UserProvider } from "@/contexts/UserContext";
import { ContractActionProvider } from "@/contexts/ContractActionContext";
import { ContractProvider } from "@/contexts/ContractContext";
import { NotificationProvider } from "@/contexts/NotificationProvider";
import { MilestoneTaskProvider } from "@/contexts/MilestoneTaskContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <ContractProvider>
          <MilestoneTaskProvider>
            <ContractActionProvider>{children}</ContractActionProvider>
          </MilestoneTaskProvider>
        </ContractProvider>
      </NotificationProvider>

    </UserProvider>
  );
}
