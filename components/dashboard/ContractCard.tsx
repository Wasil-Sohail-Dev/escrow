import { Contract } from "@/app/(dashboard)/projects/page";
import { CalendarDays } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { calculateProgress } from "@/lib/helpers/calculateProgress";
import { useUser } from "@/contexts/UserContext";
import { useContractAction } from "@/contexts/ContractActionContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/helpers/fromatDate";

const ContractCard = ({
  contract,
  fetchContractStatus,
}: {
  contract: Contract;
  fetchContractStatus: () => void;
}) => {
  const router = useRouter();
  const { user } = useUser();
  const { handleContractAction } = useContractAction();
  const { toast } = useToast();
  const [startingWork, setStartingWork] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handlePayment = () => {
    router.push(`/make-payment/${contract.contractId}`);
  };

  const handleReject = async () => {
    await handleContractAction(contract.contractId, "reject", false, () => {
      fetchContractStatus();
      router.refresh();
    });
  };

  const handleCompleteProject = async () => {
    setCompleting(true);
    try {
      const response = await fetch("/api/manage-milestone-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId: contract?.contractId,
          milestoneId:
            contract?.milestones[contract.milestones.length - 1].milestoneId,
          newStatus: "completed",
          contractStatus: "completed",
          customerId: user?._id,
          userType: user?.userType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete contract");
      }

      toast({
        title: "Project Completed Successfully",
        description: "The project has been marked as completed.",
        variant: "default",
      });
      fetchContractStatus();
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to complete project",
        description:
          "Please ensure all milestones are completed and there are no active disputes",
        variant: "destructive",
      });
      console.error("Error completing project:", error);
    } finally {
      setCompleting(false);
    }
  };

  // Check if all milestones are completed
  const allMilestonesCompleted = contract.milestones.every(
    (milestone) => milestone.status === "payment_released"
  );

  // Show complete button only for active contracts with all milestones completed
  const showCompleteButton =
    contract.status === "active" &&
    allMilestonesCompleted &&
    !user?.isButtonDisabled;

  const handleStartWorking = async () => {
    setStartingWork(true);
    try {
      const response = await fetch("/api/manage-milestone-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId: contract?.contractId,
          milestoneId: contract?.milestones[0].milestoneId,
          newStatus: "working",
          contractStatus: "active",
          customerId: user?._id,
          userType: user?.userType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contract status");
      }

      toast({
        title: "Successfully started working on the contract",
        description: "You can now start working on the contract",
        variant: "default",
      });
      fetchContractStatus();
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update contract status",
        description: "Please try again",
        variant: "warning",
      });
      console.error("Error starting work:", error);
    } finally {
      setStartingWork(false);
    }
  };

  return (
    <div
      key={contract.contractId}
      className="bg-[#D1D5DB30] rounded-[15px] p-4 flex items-center justify-between shadow-sm relative border dark:border-dark-border"
    >
      <div className="absolute top-5 left-0 h-[30px] w-[5px] bg-primary rounded-tr-[10.11px] rounded-br-[10.11px]" />
      <div className="space-y-1 w-[90%]">
        <h3 className="font-[600] leading-[24px] text-[20px] dark:text-dark-text break-words">
          {contract.title}
        </h3>
        <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60 break-words">
          {contract.description}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-subtle-medium font-[400] text-[#0D182999] dark:text-dark-text/40">
            Status:
          </p>
          <p className="text-subtle-medium text-[#445668] dark:text-dark-text/60 flex items-center gap-1">
            {contract.status}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-subtle-medium font-[400] text-[#0D182999] dark:text-dark-text/40">
            Due Date:
          </p>
          <p className="text-subtle-medium text-[#445668] dark:text-dark-text/60 flex items-center gap-1">
            <CalendarDays size={15} className="dark:text-dark-text/60" />
            {formatDate(contract.endDate)}
          </p>
        </div>
        {!user?.isButtonDisabled && (
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <Button
              variant="default"
              onClick={() =>
                router.push(`/contact-details/${contract.contractId}`)
              }
              className="bg-primary hover:bg-primary/90 text-subtle-medium text-white rounded-[9px] px-4 py-2 hover:underline transition-colors duration-200"
            >
              View Details
            </Button>

            {user?.userType === "client" &&
              (contract.status === "funding_pending" ||
                contract.status === "funding_processing") && (
                <Button
                  variant="default"
                  onClick={handlePayment}
                  className="bg-secondary hover:bg-secondary/90 text-white rounded-[9px] px-4 py-2 hover:underline transition-colors duration-200"
                >
                  Make Payment
                </Button>
              )}

            {user?.userType === "vendor" &&
              contract?.status === "funding_onhold" && (
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-white rounded-[9px] px-4 py-2 hover:underline transition-colors duration-200"
                  onClick={handleStartWorking}
                  disabled={startingWork}
                >
                  {startingWork ? "Starting..." : "Start Working"}
                </Button>
              )}

            {user?.userType === "vendor" &&
              contract?.status === "onboarding" && (
                <>
                  <Button
                    variant="secondary"
                    className="text-base-medium text-white rounded-[9px] px-4 py-2 hover:bg-secondary/90 transition-colors duration-200"
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    className="text-base-medium text-white rounded-[9px] px-4 py-2 hover:bg-primary/90 transition-colors duration-200"
                    onClick={() =>
                      handleContractAction(contract.contractId, "accept")
                    }
                  >
                    Accept
                  </Button>
                </>
              )}

            {showCompleteButton && (
              <Button
                variant="default"
                onClick={handleCompleteProject}
                disabled={completing}
                className="bg-success-btn hover:bg-success-btn-hover text-white rounded-[9px] px-4 py-2 transition-colors duration-200 flex items-center gap-2"
              >
                {completing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Completing...
                  </>
                ) : (
                  <>Complete Project</>
                )}
              </Button>
            )}
          </div>
        )}
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
  );
};

export default ContractCard;
