"use client";

import React, { useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import Topbar from "../../../../components/dashboard/Topbar";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Milestone } from "@/lib/helpers/calculateProgress";
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

const ProjectsPage = () => {
  const { type } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchContractStatus = async () => {
    const customerId = user?._id;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/get-contract-status?customerId=${customerId}&role=${user?.userType}&status=${type}`
      );
      const { data } = await response.json();
      setContracts(data);
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
      <Topbar title="Overview" description="Detailed information about your work" />
      <div className="flex flex-col gap-2 lg:px-10 mt-[85px]">
        {loading ? (
          <Loader size="lg" text="Loading contracts..." />
        ) : contracts && contracts.length > 0 ? contracts.map((contract) => (
          <ContractCard key={contract._id} contract={contract} />
        )):
          <div className="flex justify-center items-center mt-[100px]">
            <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60">No contracts found in this status {type}</p>
          </div>
        }
      </div>
    </>
  );
};

export default ProjectsPage;
