"use client";
import React, { useEffect, useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";
import WorkSubmissionModal from "@/components/modals/WorkSubmissionModal";
import RevisionRequestModal from "@/components/modals/RevisionRequestModal";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { getDuration } from "@/lib/helpers/getDuration";

interface MilestoneFile {
  name: string;
  size: string;
  type: "pdf" | "xls";
}

interface Milestone {
  title: string;
  payment: string;
  deliveryDate: string;
  status: "completed" | "pending";
  description: string[];
  files: MilestoneFile[];
}

interface Contract {
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
  budget: number;
  paymentType: string;
  milestones: {
    title: string;
    amount: number;
    description: string;
    status: "completed" | "pending";
    _id: string;
    milestoneId: string;
  }[];
  status: string;
  startDate: string;
  endDate: string;
}

const milestones: Milestone[] = [
  {
    title: "Logo Concepts",
    payment: "$200",
    deliveryDate: "12/20/2024",
    status: "completed",
    description: [
      "Manage accounts worth $4.7 million in annual sales",
      "Selected to train 3 new account managers on the basis of my stellar track record",
      "Increased business revenue by 150% by implementing new customer service initiative",
      "Recovered 15 dormant accounts worth a total of $500,000",
    ],
    files: [
      { name: "New file.pdf", size: "1.2 MB", type: "pdf" },
      { name: "Folder.xls", size: "8 MB", type: "xls" },
    ],
  },
  {
    title: "Finalized Logo and Guidelines",
    payment: "$200",
    deliveryDate: "12/21/2024",
    status: "pending",
    description: [
      "Networked effectively with clients, increasing revenue by 47% in just 5 months",
      "Selected as Employee of the Month as well as Top Salesperson 3 times for exceeding sales objectives",
    ],
    files: [],
  },
  {
    title: "Marketing Material Templates",
    payment: "$200",
    deliveryDate: "12/21/2024",
    status: "pending",
    description: [
      "Monitored client accounts, analyzed incomings and outgoings, and performed daily, weekly, and annual forecasts",
      "Exceeded 2014 sales target by 47%",
      "Strategized with team to win market share from competitors",
    ],
    files: [
      { name: "New file.pdf", size: "8 MB", type: "pdf" },
      { name: "Folder.xls", size: "8 MB", type: "xls" },
    ],
  },
];

const ContactDetails = () => {
  const router = useRouter();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  const { contractID } = useParams<{ contractID: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const { toast } = useToast();
  const {user} = useUser();
  const fetchContract = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/get-contract?contractId=${contractID}`);
      if (response.data.message === "Contract details retrieved successfully.") {
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
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (contractID) fetchContract();
  }, [contractID, toast]);

  const handleAction = async (action: string) => {
    try {
      await axios.patch("/api/handle-invite", {
        contractId: contractID,
        action,
      });
      toast({
        title: "Success",
        description: "Contract action successful.",
        variant: "default",
      });
      fetchContract()
    } catch (error) {
      console.error("Error handling contract action:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "warning",
      });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center mt-[100px]">
      <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60">Loading...</p>
    </div>
  )

  return (
    <>
      <Topbar
        title={contract?.title || "Graphic Designing"}
        description="Contract Details and Information"
      />
      <div className="flex-1 mt-[85px] w-full">
        <div className="flex lg:flex-row flex-col justify-between gap-6 lg:gap-0 w-full">
          <div className="flex flex-col gap-6 w-full max-w-3xl">
            <div className="flex justify-between items-center">
              <h2 className="text-paragraph dark:text-white text-heading3-bold">
                {contract?.title || "Graphic Designing"}
              </h2>
              {contract?.status === "onboarding" && <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" className="text-base-medium text-white rounded-[12px]" onClick={() => handleAction("reject")}>Reject</Button>
                <Button className="text-base-medium text-white rounded-[12px]" onClick={() => handleAction("accept")}>Accept</Button>
              </div>}
            </div>
            <div className="border-b border-[#D0D0D04D] dark:border-dark-border pb-6">
              <p className="text-sm text-paragraph dark:text-dark-2 text-small-medium font-[400]">
                Contract ID: {contract?.contractId}
              </p>
              <p className="mt-2 text-paragraph dark:text-dark-text text-base-regular w-full">
                {contract?.description}
              </p>
            </div>
            <div className="border-b border-[#D0D0D04D] dark:border-dark-border pb-6 flex justify-between">
              <div className="flex flex-col gap-1 text-paragraph dark:text-dark-text text-base-regular">
                <div className="flex items-center gap-2">
                  <p className="">Duration:</p>
                  <p className="">{getDuration(contract?.startDate, contract?.endDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>Project Cost:</p>
                  <p className="">${contract?.budget.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>Start Date:</p>
                  <p className="">{new Date(contract?.startDate || "").toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>End Date:</p>
                  <p className="">{new Date(contract?.endDate || "").toLocaleDateString()}</p>
                </div>
              </div>

              <Link href="/transection-details">
                {contract?.status !== "onboarding" && <Button className="text-[14px] font-[700] leading-[20px] bg-primary text-white dark:bg-primary dark:text-dark-text px-2 md:px-6 rounded-lg hover:bg-primary-500 dark:hover:bg-primary-500 transition-colors md:h-[46px] h-[36px]">
                  Payment History
                </Button>}
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between lg:justify-start gap-8">
            <div>
              <h3 className="text-[12px] font-[400] leading-[16px] text-paragraph dark:text-dark-2 mb-1">
                FROM - CLIENT
              </h3>
              <div className="space-y-0.5">
                <p className="text-[20px] font-bold leading-[28px] dark:text-dark-text">
                  {contract?.clientId.userName}
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  Client
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  {contract?.clientId.email}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-[400] leading-[16px] text-paragraph dark:text-dark-2 mb-1">
                TO - VENDOR
              </h3>
              <div className="space-y-0.5">
                <p className="text-[20px] font-bold leading-[28px] dark:text-dark-text">
                  {contract?.vendorId.userName}
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  Vendor
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  {contract?.vendorId.email}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Milestones Section */}
        <div className="flex flex-col gap-6 max-w-3xl mt-5">
          <p className="text-paragraph dark:text-dark-text text-[15px] font-[500] leading-[17px]">
            Milestones
          </p>

          {contract?.milestones.map((milestone, index) => (
            <div
              key={index}
              className="flex md:flex-row flex-col md:justify-between"
            >
              <div className="flex flex-col gap-3 relative pl-8 max-w-md">
                <div
                  className={`w-[13px] h-[13px] rounded-full ${
                    milestone.status === "completed"
                      ? "bg-primary"
                      : "bg-paragraph dark:bg-dark-2"
                  } absolute left-[0px] top-1`}
                ></div>
                <div
                  className={`absolute left-[5px] top-2 bottom-0 w-[2px]  ${
                    milestone.status === "completed"
                      ? "bg-primary"
                      : "bg-paragraph dark:bg-dark-2"
                  }`}
                ></div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-[16px] font-[600] leading-[19px] text-paragraph dark:text-dark-text">
                        {milestone.title}
                      </span>
                      <span className="text-paragraph dark:text-dark-2 text-[12px] font-[400] leading-[16px]">
                        (Milestone Payment: ${milestone.amount})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-paragraph dark:text-dark-2 text-[12px] font-[400] leading-[16px]">
                        Status: {milestone.status}
                      </span>
                      <button
                        onClick={() => setIsWorkModalOpen(true)}
                        className="text-primary underline text-[12px] font-[600] leading-[19px]"
                      >
                        View Submitted Work
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-1">
                  <ul className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-paragraph dark:bg-dark-2 mt-2"></span>
                      <li className="text-paragraph dark:text-dark-text text-[14px] font-[400] leading-[19px]">
                        {milestone.description}
                      </li>
                    </div>
                  </ul>
                </div>
              </div>
              <div className=" mt-4 md:mt-0 flex justify-end">
                {contract?.status !== "onboarding" && <Button
                  onClick={() => {
                    if (user?.userType === "client") {
                      setIsRevisionModalOpen(true);
                    } else {
                      router.push("/milestone-submission");
                    }
                  }}
                  className={`text-[14px] font-[700] leading-[20px] ${
                    (milestone.status === "completed" || true)
                      ? "bg-primary hover:bg-primary-500 dark:bg-primary dark:hover:bg-primary-500 dark:text-dark-text"
                      : "bg-[#CACED8] hover:bg-[#CACED8]/90 dark:bg-[#CACED8] dark:hover:bg-[#CACED8]/90 dark:text-white"
                  } text-white px-6 md:px-10 rounded-lg transition-colors md:h-[46px] h-[36px]`}
                >
                  {user?.userType === "client" ? "Request Revision" : "Submit Work"}
                </Button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <WorkSubmissionModal
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        setIsRevisionModalOpen={() => setIsRevisionModalOpen(true)}
      />
      <RevisionRequestModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
      />
    </>
  );
};

export default ContactDetails;
