"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastContractElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchContractStatus = async (
    pageNum: number,
    isInitialLoad = false
  ) => {
    const customerId = user?._id;
    if (!customerId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/get-customer-contracts?customerId=${customerId}&role=${user?.userType}&page=${pageNum}&limit=10`
      );
      const { data, pagination } = await response.json();

      if (isInitialLoad) {
        setContracts(
          [...data].filter((contract) => contract.status !== "cancelled")
        );
      } else {
        setContracts((prev) => [
          ...prev,
          ...[...data].filter((contract) => contract.status !== "cancelled"),
        ]);
      }

      setHasMore(pagination.page < pagination.totalPages);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContractStatus(1, true);
    }
  }, [user]);

  useEffect(() => {
    if (page > 1) {
      fetchContractStatus(page, false);
    }
  }, [page]);

  return (
    <>
      <Topbar
        title="Projects"
        description="Detailed information about your Contracts"
      />
      <div className="flex flex-col gap-2 lg:px-10 mt-[85px]">
        {/* <h1 className="text-2xl font-bold dark:text-dark-text">All Projects</h1> */}
        {contracts && contracts.length > 0 ? (
          <>
            {contracts.map((contract, index) => {
              if (contracts.length === index + 1) {
                return (
                  <div ref={lastContractElementRef} key={contract._id}>
                    <ContractCard
                      contract={contract}
                      fetchContractStatus={() =>
                        fetchContractStatus(page, true)
                      }
                    />
                  </div>
                );
              } else {
                return (
                  <ContractCard
                    key={contract._id}
                    contract={contract}
                    fetchContractStatus={() => fetchContractStatus(page, true)}
                  />
                );
              }
            })}
            {loading && (
              <div className="py-4">
                <Loader
                  size="md"
                  text="Loading more contracts..."
                  fullHeight={false}
                />
                {/* <div className="w-full h-[10px] bg-gray-200 animate-pulse">Loading more contracts...</div> */}
              </div>
            )}
          </>
        ) : loading ? (
          <Loader size="lg" text="Loading contracts..." />
        ) : (
          <div className="flex justify-center items-center mt-[100px]">
            <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text">
              No contracts found
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;
