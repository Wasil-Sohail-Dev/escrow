"use client"; // Required for hooks like useParams

import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type Milestone = {
  milestoneId: string;
  title: string;
  description: string;
  amount: number;
  status: string;
};

type Contract = {
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
  milestones: Milestone[];
  status: string;
  substatus: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

const Page = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/get-contract?contractId=${contractId}`);
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

    if (contractId) fetchContract();
  }, [contractId, toast]);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      await axios.patch("/api/handle-invite", {
        contractId,
        action,
      });
      toast({
        title: "Success",
        description: "Contract action successful.",
        variant: "default",
      });
      router.push("/home");
    } catch (error) {
      console.error("Error handling contract action:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar
        title="Invited Contracts"
        description="Review the contract and make your decision."
      />

      <div className="mt-[85px] max-w-4xl mx-auto">
        {loading && (
          <div className="text-center text-lg">
            <p>Loading...</p>
            <div className="loader"></div>
          </div>
        )}

        {!loading && contract && (
          <>
            <h1 className="text-3xl font-bold text-main-heading dark:text-white mb-4">
              Contract: {contract.title}
            </h1>

            <p className="text-lg text-secondary-heading dark:text-dark-2 mb-6">
              {contract.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">Contract ID:</p>
                <p className="text-paragraph dark:text-dark-text">{contract.contractId}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">Budget:</p>
                <p className="text-paragraph dark:text-dark-text">${contract.budget}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">Payment Type:</p>
                <p className="text-paragraph dark:text-dark-text">{contract.paymentType}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">Status:</p>
                <p className="text-paragraph dark:text-dark-text">{contract.status}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">Start Date:</p>
                <p className="text-paragraph dark:text-dark-text">{new Date(contract.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">End Date:</p>
                <p className="text-paragraph dark:text-dark-text">{new Date(contract.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-main-heading dark:text-white mb-4">
              Milestones
            </h2>

            <ul className="space-y-4">
              {contract.milestones.map((milestone) => (
                <li
                  key={milestone.milestoneId}
                  className="border border-muted dark:border-dark-border bg-white dark:bg-dark-3 shadow-sm p-4 rounded-lg"
                >
                  <h3 className="font-medium text-lg text-secondary-heading dark:text-dark-2 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-paragraph dark:text-dark-text mb-2">
                    {milestone.description}
                  </p>
                  <p className="text-paragraph font-medium dark:text-dark-text">
                    Amount: ${milestone.amount} - Status: {milestone.status}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex justify-end space-x-4 mt-8">
              <Button
                variant="default"
                className="bg-primary hover:bg-primary-hover text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                onClick={() => handleAction("accept")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Accept"}
              </Button>
              <Button
                className="bg-error-btn hover:bg-error-btn-hover text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                onClick={() => handleAction("reject")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Reject"}
              </Button>
            </div>
          </>
        )}

        {(!loading && !contract) && (
          <p className="text-center text-lg text-error">No contract details found.</p>
        )}
      </div>
    </>
  );
};

export default Page;
