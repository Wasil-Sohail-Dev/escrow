"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Topbar from "../../../../components/dashboard/Topbar";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { calculateProgress, Milestone } from "@/lib/helpers/calculateProgress";
import { Button } from "@/components/ui/button";



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
          <div className="flex justify-center items-center mt-[100px]">
            <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60">Loading...</p>
          </div>
        ) : contracts && contracts.length > 0 ? contracts.map((contract) => (
          <div
            key={contract.contractId}
            className="bg-[#D1D5DB30] rounded-[15px] p-4 flex items-center justify-between shadow-sm relative
              border dark:border-dark-border"
          >
            <div className="absolute top-5 left-0 h-[30px] w-[5px] bg-primary rounded-tr-[10.11px] rounded-br-[10.11px]" />
            <div className="space-y-1">
              <h3 className="font-[600] leading-[24px] text-[20px] dark:text-dark-text">
                {contract.title}
              </h3>
              <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60">
                {contract.description}
              </p>
              <p className="text-subtle-medium font-[400] text-[#0D182999] dark:text-dark-text/40">
                Due Date
              </p>
              <p className="text-subtle-medium text-[#445668] dark:text-dark-text/60 flex items-center gap-1">
                <CalendarDays size={15} className="dark:text-dark-text/60" />
                {new Date(contract.endDate).toLocaleDateString()}
              </p>
              <Button
                variant="default"
                onClick={() => router.push(`/contact-details/${contract.contractId}`)}
                className="bg-primary hover:bg-primary/90 text-subtle-medium text-white rounded-[9px] px-4 py-2 hover:underline
                transition-colors duration-200"
              >
                View Details
              </Button>
            </div>
            <div style={{ width: 80, height: 80, marginRight: "30px" }}>
              <CircularProgressbar
                value={calculateProgress(contract.milestones)}
                text={`${calculateProgress(contract.milestones)}%`}
                strokeWidth={12}
                styles={buildStyles({
                  rotation: 0,
                  strokeLinecap: "round",
                  textSize: "17px",
                  pathTransitionDuration: 0.5,
                  pathColor: "#26B893",
                  textColor: "#26B893",
                  trailColor: "white",
                })}
              />
            </div>
          </div>
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
