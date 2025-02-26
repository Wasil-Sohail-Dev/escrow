"use client";

import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useContractAction } from "@/contexts/ContractActionContext";
import { useContract } from "@/contexts/ContractContext";
import Loader from "@/components/ui/loader";
import { useUser } from "@/contexts/UserContext";
import BlockedAlert from "@/components/dashboard/BlockedAlert";

const Page = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [actionLoading, setActionLoading] = useState<{
    accept: boolean;
    reject: boolean;
  }>({ accept: false, reject: false });

  const { contract, loading, fetchContract } = useContract();
  const { handleContractAction } = useContractAction();
  const { user } = useUser();

  useEffect(() => {
    if (contractId) {
      fetchContract(contractId);
    }
  }, [contractId]);

  const handleAction = async (action: "accept" | "reject") => {
    setActionLoading((prev) => ({ ...prev, [action]: true }));
    await handleContractAction(contractId, action, true);
    setActionLoading((prev) => ({ ...prev, [action]: false }));
  };

  return (
    <>
      <Topbar
        title="Invited Contracts"
        description="Review the contract and make your decision."
      />

      <main className="mt-[85px] max-w-4xl mx-auto">
        {user?.isButtonDisabled && <BlockedAlert user={user} />}
        {loading ? (
          <Loader size="lg" text="Loading contract details..." />
        ) : contract ? (
          <>
            <h1 className="text-3xl font-bold text-main-heading dark:text-white mb-4">
              Contract: {contract.title}
            </h1>

            <p className="text-lg text-secondary-heading dark:text-dark-2 mb-6">
              {contract.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">
                  Contract ID:
                </p>
                <p className="text-paragraph dark:text-dark-text">
                  {contract.contractId}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">
                  Budget:
                </p>
                <p className="text-paragraph dark:text-dark-text">
                  ${contract.budget}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">
                  Payment Type:
                </p>
                <p className="text-paragraph dark:text-dark-text">
                  {contract.paymentType}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">
                  Status:
                </p>
                <p className="text-paragraph dark:text-dark-text">
                  {contract.status}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">
                  Start Date:
                </p>
                <p className="text-paragraph dark:text-dark-text">
                  {new Date(contract.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground dark:text-dark-2">
                  End Date:
                </p>
                <p className="text-paragraph dark:text-dark-text">
                  {new Date(contract.endDate).toLocaleDateString()}
                </p>
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
                  <h3 className="font-medium text-lg text-secondary-heading dark:text-dark-2 mb-2 break-all">
                    {milestone.title}
                  </h3>
                  <p className="text-paragraph dark:text-dark-text mb-2 break-all">
                    {milestone.description}
                  </p>
                  <p className="text-paragraph font-medium dark:text-dark-text">
                    Amount: ${milestone.amount} - Status: {milestone.status}
                  </p>
                </li>
              ))}
            </ul>

            {user?.userType === "vendor" && !user?.isButtonDisabled && (
              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary-hover text-white font-medium py-2 px-6 rounded-lg transition duration-200 min-w-[120px]"
                  onClick={() => handleAction("accept")}
                  disabled={actionLoading.accept || actionLoading.reject}
                >
                  {actionLoading.accept ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Accept"
                  )}
                </Button>
                <Button
                  className="bg-error-btn hover:bg-error-btn-hover text-white font-medium py-2 px-6 rounded-lg transition duration-200 min-w-[120px]"
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading.accept || actionLoading.reject}
                >
                  {actionLoading.reject ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Reject"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-lg text-error">
            No contract details found.
          </p>
        )}
      </main>
    </>
  );
};

export default Page;
