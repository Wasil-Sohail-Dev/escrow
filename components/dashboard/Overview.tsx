"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BlockedAlert from "./BlockedAlert";
import ProjectCard from "./ProjectCard";
import { useUser } from "@/contexts/UserContext";
import Loader from "../ui/loader";

export type TabOption = "active" | "completed" | "all" | "disputes" | "pending" | "progress" | "resolved" | "cancelled";

interface ContractStatusCount {
  draft: number;
  onboarding: number;
  funding_pending: number;
  funding_processing: number;
  funding_onhold: number;
  active: number;
  in_review: number;
  completed: number;
  cancelled: number;
  disputed: number;
  disputed_in_process: number;
  disputed_resolved: number;
  totalContracts: number;
}

interface OverviewProps {
  dispute?: boolean;
  activeTab?: TabOption;
  setActiveTab?: (tab: TabOption) => void;
  onDataFetched?: (data: any) => void;
}

const Overview = ({ dispute, activeTab, setActiveTab, onDataFetched }: OverviewProps) => {
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState<any>(null);
  const [counts, setCounts] = useState<ContractStatusCount>({
    draft: 0,
    onboarding: 0,
    funding_pending: 0,
    funding_processing: 0,
    funding_onhold: 0,
    active: 0,
    in_review: 0,
    completed: 0,
    cancelled: 0,
    disputed: 0,
    disputed_in_process: 0,
    disputed_resolved: 0,
    totalContracts: 0
  });
  const router = useRouter();
  const { user } = useUser();

  const fetchSortedContracts = async () => {
    if (!user?._id) return;
    const response = await fetch(`/api/get-sorted-contracts?customerId=${user._id}&role=${user?.userType}`);
    const {data} = await response.json();
    setCounts(data);
  };

  const fetchContractDetails = async (taba: TabOption) => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/get-contract-details?customerId=${user._id}&status=${taba}&limit=5&userType=${user.userType}`);
      const data = await response.json();
      if (data.success) {
        setContractData(data.data);
        onDataFetched?.(data.data);
      } else {
        setContractData(null);
        onDataFetched?.(null);
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
      setContractData(null);
      onDataFetched?.(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSortedContracts();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab) {
      setContractData(null);
      onDataFetched?.(null);
      fetchContractDetails(activeTab);
    }
  }, [user, activeTab]);

  const getFilteredCount = (tab: TabOption) => {
    switch (tab) {
      case "active":
        return counts.active;
      case "completed":
        return counts.completed;
      case "all":
        return counts.totalContracts;
      case "cancelled":
        return counts.cancelled;
      default:
        return 0;
    }
  };

  const getDisputeCount = (tab: any) => {
    switch (tab) {
      case "disputed":
        return counts.disputed;
      case "disputed_in_process":
        return counts.disputed_in_process;
      case "disputed_in_process":
        return counts.disputed_in_process;
      case "disputed_resolved":
        return counts.disputed_resolved;
      default:
        return 0;
    }
  };

  const latestContract = contractData?.latestContract;

  return (
    <>
      {true ? (
        <div
          className={`mb-4 flex justify-end ${
            dispute
              ? "justify-end"
              : "justify-end"
          }`}
        >
          {/* {dispute && (
            <div className="flex items-center text-[20px] font-[800] leading-[24px] text-[#3A3A3A] gap-6 dark:text-dark-text">
              Sort by:{" "}
              <span className="text-[14px] font-[500] leading-[16.8px] underline">
                Status
              </span>{" "}
              <span className="text-[14px] font-[500] leading-[16.8px]">|</span>{" "}
              <span className="text-[14px] font-[500] leading-[16.8px] underline">
                Date
              </span>
            </div>
          )} */}
          {(dispute || user?.userType === 'client') && <Button
            className={`bg-primary hover:bg-primary/90 px-6 py-6 rounded-md flex items-center gap-2 text-small-medium text-white ${
              dispute
                ? "bg-[#E71D1D] hover:bg-[#E71D1D]/90"
                : "bg-primary hover:bg-primary/90"
            }`}
            onClick={() => {
              if (dispute) {
                router.push("/create-dispute");
              } else {
                router.push("/create-contract");
              }
            }}
          >
            <Plus />
            {dispute ? "Create New Dispute" : "Create New Contract"}
          </Button>}
        </div>
      ) : (
        <BlockedAlert />
      )}
      <div
        className="grid lg:grid-cols-4 md:grid-cols-2 max-md:grid-cols-1 
        lg:gap-4 md:gap-4 max-md:gap-3 mb-4"
      >
        <ProjectCard
          title={dispute ? "Total Disputes Raised" : "Active Projects"}
          count={dispute? getDisputeCount("disputed") :getFilteredCount("active")}
          status="active"
          viewDetailsLink={
            dispute
              ? "/dispute-management-screen/disputed"
              : "/projects/active"
          }
          dispute={dispute}
        />
        <ProjectCard
          title={dispute ? "Pending Disputes" : "Completed Projects"}
          count={dispute? getDisputeCount("disputed_in_process") : getFilteredCount("completed") }
          status="completed"
          viewDetailsLink={
            dispute
              ? "/dispute-management-screen/disputed_in_process"
              : "/projects/completed"
          }
          dispute={dispute}
        />
        <ProjectCard
          title={dispute ? "In Progress Disputes" : "All Projects"}
          count={dispute? getDisputeCount("disputed_in_process") : getFilteredCount("all")}
          status="all"
          viewDetailsLink={
            dispute
              ? "/dispute-management-screen/disputed_in_process"
              : "/projects/all"
          }
          dispute={dispute}
        />
        <ProjectCard
          title={dispute ? "Resolved Disputes" : "Cancelled Projects"}
          count={dispute? getDisputeCount("disputed_resolved") : getFilteredCount("cancelled")}
          status="dispute"
          viewDetailsLink={
            dispute
              ? "/dispute-management-screen/disputed_resolved"
              : "/projects/disputed"
          }
          dispute={dispute}
        />
      </div>
      {!dispute ? (
        <div
          className="flex lg:gap-8 md:gap-6 max-md:gap-4 border-b dark:border-dark-border
        lg:overflow-visible md:overflow-visible max-md:overflow-x-auto 
        max-md:pb-2 max-md:scrollbar-hide"
        >
          {["Active", "Cancelled", "Completed", "All"].map((tab) => {
            const tabValue = tab.toLowerCase() as TabOption;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab?.(tabValue)}
                className={`pb-2 px-1 relative whitespace-nowrap
                lg:text-body-normal md:text-base-regular max-md:text-small-regular ${
                  activeTab === tabValue
                    ? "text-primary dark:text-primary"
                    : "text-[#D7DAE1] dark:text-dark-text/60"
                }`}
              >
                {tab}
                {activeTab === tabValue && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      ):
      <div
          className="flex lg:gap-8 md:gap-6 max-md:gap-4 border-b dark:border-dark-border
        lg:overflow-visible md:overflow-visible max-md:overflow-x-auto 
        max-md:pb-2 max-md:scrollbar-hide"
        >
          {["Disputes", "Progress", "Resolved"].map((tab) => {
            let value:string;
            switch(tab){
              case "Disputes":
                value="disputed"
                break;
              case "Pending":
                value="disputed_in_process"
                break;
              case "Progress":
                value="disputed_in_process"
                break;
              case "Resolved":
                value="disputed_resolved"
                break;
            }
            const tabValue = tab.toLowerCase() as any;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab?.(value as TabOption)}
                className={`pb-2 px-1 relative whitespace-nowrap
                lg:text-body-normal md:text-base-regular max-md:text-small-regular ${
                  activeTab === tabValue
                    ? "text-primary dark:text-primary"
                    : "text-[#D7DAE1] dark:text-dark-text/60"
                }`}
              >
                {tab}
                {activeTab === (value!)  && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      }
      <div className="rounded-lg mt-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2 max-md:gap-2">
            <h2 className="lg:text-[22px] md:text-[20px] max-md:text-heading4-medium leading-[27.5px] font-bold dark:text-dark-text">
              {`${((activeTab as any) === "disputed_in_process") ? "Disputed In Process" : ((activeTab as any) === "disputed_resolved") ? "Disputed Resolved" : activeTab?.charAt(0).toUpperCase() + activeTab?.slice(1)!} Projects`}
            </h2>
            <span className="text-white rounded-full lg:w-6 lg:h-6 md:w-5 md:h-5 max-md:w-5 max-md:h-5 lg:text-subtle-semibold md:text-small-semibold max-md:text-tiny-medium flex items-center justify-center mt-1 bg-[#EC1A1A]">
              {dispute ? getDisputeCount(activeTab) : getFilteredCount(activeTab as TabOption)}
            </span>
          </div>
          <Link href={`/projects/${activeTab}`} className="lg:text-base1-semibold md:text-base-semibold max-md:text-small-semibold underline flex items-center gap-2 dark:text-dark-text">
            See Details <ChevronDown size={20} />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[130px]">
            <Loader fullHeight={false} />
            </div>
        ) : latestContract ? (
          <div className="mt-10 flex justify-between">
            <div className="flex lg:gap-6 md:gap-5 max-md:gap-4 text-start">
              <Image
                src="/assets/Icon.svg"
                alt="project"
                width={85}
                height={85}
                className="lg:w-[85px] md:w-[75px] max-md:w-[65px] lg:h-[85px] md:h-[75px] max-md:h-[65px] dark:invert"
              />
              <div className="flex flex-col lg:gap-2 md:gap-1.5 max-md:gap-1">
                <h2 className="lg:text-heading3-reg md:text-heading4-medium max-md:text-base-medium dark:text-dark-text">
                  ID: {latestContract.contractId}
                </h2>
                <p className="lg:text-heading4-light md:text-body-normal max-md:text-base-regular text-secondary-heading dark:text-dark-text/60">
                  {user?.userType === 'client' ? latestContract.vendorId.userName : latestContract.clientId.userName}
                </p>
              </div>
            </div>

            {!dispute ? (
              <div className="flex flex-col lg:gap-2 md:gap-1.5 max-md:gap-1 items-end">
                <h2 className="lg:text-body-bold md:text-body-semibold max-md:text-base-semibold dark:text-dark-text">
                  ${latestContract.budget.toFixed(2)}
                </h2>
                <p className="lg:text-small-regular md:text-small-regular max-md:text-tiny-medium text-secondary-heading dark:text-dark-text/60">
                  Deadline: {new Date(latestContract.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ) : (
              <p className="text-base-regular text-[#7B878C] dark:text-dark-text items-end justify-end">
                Date Created: {new Date(latestContract.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[130px] text-base-regular text-[#0D1829B2] dark:text-dark-text/60">No contracts found</div>
        )}
      </div>
    </>
  );
};

export default Overview;
