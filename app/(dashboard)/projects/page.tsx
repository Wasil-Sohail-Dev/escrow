"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { calculateProgress, Milestone } from "@/lib/helpers/calculateProgress";
import { Button } from "@/components/ui/button";
import Topbar from "@/components/dashboard/Topbar";
import ContractCard from "@/components/dashboard/ContractCard";
import Loader from "@/components/ui/loader";

export interface Contract {
  _id: string;
  contractId: string;
  title: string;
  description: string;
  clientId: string;
  vendorId: string;
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

const Projects = () => {
  const { user } = useUser();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchContractStatus = async () => {
    const customerId = user?._id;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/get-customer-contracts?customerId=${customerId}&role=${user?.userType}`
      );
      const { data } = await response.json();
      setContracts([...data].filter((contract) => contract.status !== "cancelled"));
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContractStatus();
    }
  }, [user]);

  return (
    <>
      <Topbar title="Projects" description="Detailed information about your Contracts" />
      <div className="flex flex-col gap-2 lg:px-10 mt-[85px]">
        <h1 className="text-2xl font-bold">All Projects</h1>
        {loading ? (
          <Loader size="lg" text="Loading contracts..." />
        ) : contracts && contracts.length > 0 ? (
          contracts.map((contract) => (
            <ContractCard key={contract._id} contract={contract} fetchContractStatus={fetchContractStatus} />
          ))
        ) : (
          <div className="flex justify-center items-center mt-[100px]">
            <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60">
              No contracts found
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;
