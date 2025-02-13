"use client";

import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MilestoneTaskContextProps {
  handleMilestoneAction: (params: {
    contractId: string;
    milestoneId: string;
    action: 'vendor_submitted' | 'client_requested_changes' | 'client_approved';
    userId: string;
    title: string;
    description: string;
    userRole: string;
    files?: File[];
    onSuccess?: () => void;
  }) => Promise<void>;
}

const MilestoneTaskContext = createContext<MilestoneTaskContextProps | undefined>(undefined);

export const MilestoneTaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();

  const handleMilestoneAction = async ({
    contractId,
    milestoneId,
    action,
    userId,
    title,
    description,
    userRole,
    files,
    onSuccess
  }: {
    contractId: string;
    milestoneId: string;
    action: 'vendor_submitted' | 'client_requested_changes' | 'client_approved';
    userId: string;
    title: string;
    description: string;
    userRole: string;
    files?: File[];
    onSuccess?: () => void;
  }) => {
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add JSON data
      const jsonData = {
        contractId,
        milestoneId,
        action,
        userId,
        title,
        description,
        userRole,
      };
      formData.append('data', JSON.stringify(jsonData));

      // Add files if they exist
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await fetch("/api/manage-milestone-tasks", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Action completed successfully",
          variant: "default",
        });
        onSuccess?.();
      } else {
        throw new Error(data.error || "Failed to complete action");
      }
    } catch (error: any) {
      console.error("Error handling milestone action:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete action. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <MilestoneTaskContext.Provider value={{ handleMilestoneAction }}>
      {children}
    </MilestoneTaskContext.Provider>
  );
};

export const useMilestoneTask = () => {
  const context = useContext(MilestoneTaskContext);
  if (context === undefined) {
    throw new Error('useMilestoneTask must be used within a MilestoneTaskProvider');
  }
  return context;
}; 