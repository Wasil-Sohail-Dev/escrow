"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastContractElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchContractStatus = async (pageNum: number, isInitialLoad = false) => {
    const customerId = user?._id;
    if (!customerId) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        customerId,
        role: user.userType,
        status: type as string,
        page: pageNum.toString(),
        limit: "5"
      });

      const response = await fetch(
        `/api/get-contract-status?${queryParams.toString()}`
      );
      const { data, pagination } = await response.json();
      
      if (Array.isArray(data)) {
        if (isInitialLoad) {
          setContracts(data);
        } else {
          setContracts(prev => [...prev, ...data]);
        }
        setHasMore(pagination.page < pagination.totalPages);
      } else {
        console.error("Invalid data format received:", data);
        setContracts([]);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setPage(1);
      setContracts([]);
      fetchContractStatus(1, true);
    }
  }, [user, type]);

  useEffect(() => {
    if (page > 1) {
      fetchContractStatus(page, false);
    }
  }, [page]);

  return (
    <>
      <Topbar title="Overview" description="Detailed information about your work" />
      <div className="flex flex-col gap-2 lg:px-10 mt-[85px]">
        {contracts && contracts.length > 0 ? (
          <>
            {contracts.map((contract, index) => {
              if (contracts.length === index + 1) {
                return (
                  <div ref={lastContractElementRef} key={contract._id}>
                    <ContractCard 
                      contract={contract} 
                      fetchContractStatus={() => {
                        setPage(1);
                        fetchContractStatus(1, true);
                      }} 
                    />
                  </div>
                );
              } else {
                return (
                  <ContractCard 
                    key={contract._id} 
                    contract={contract} 
                    fetchContractStatus={() => {
                      setPage(1);
                      fetchContractStatus(1, true);
                    }} 
                  />
                );
              }
            })}
            {loading && (
              <div className="py-4 flex justify-center">
                <Loader size="sm" text="Loading more contracts..." fullHeight={false} />
              </div>
            )}
          </>
        ) : loading ? (
          <Loader size="lg" text="Loading contracts..." />
        ) : (
          <div className="flex justify-center items-center mt-[100px]">
            <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60">
              No contracts found in this status {type}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsPage;
