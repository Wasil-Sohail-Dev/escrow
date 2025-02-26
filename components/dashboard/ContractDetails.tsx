"use client";
import React, { useEffect, useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import WorkSubmissionModal from "@/components/modals/WorkSubmissionModal";
import RevisionRequestModal from "@/components/modals/RevisionRequestModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { getDuration } from "@/lib/helpers/getDuration";
import { useContractAction } from "@/contexts/ContractActionContext";
import { useContract } from "@/contexts/ContractContext";
import Loader from "@/components/ui/loader";
import { formatDate } from "@/lib/helpers/fromatDate";
import { Eye } from "lucide-react";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import {
  handleFileDownload,
  convertS3FilesToPreviewFiles,
} from "@/lib/helpers/fileHelpers";

const ContactDetails = ({
  isAdmin = false,
  contractID,
}: {
  isAdmin: boolean;
  contractID: string;
}) => {
  const router = useRouter();

  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [mileStoneData, setMileStoneData] = useState<any>(null);
  const { user } = useUser();
  const { contract, loading, fetchContract } = useContract();
  const { handleContractAction } = useContractAction();
  const { toast } = useToast();
  const [startingWork, setStartingWork] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (contractID) {
      fetchContract(contractID);
    }
  }, [contractID]);

  const handleAction = async (action: "accept" | "reject") => {
    await handleContractAction(contractID, action);
    fetchContract(contractID);
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
            contract?.milestones[contract?.milestones.length - 1]?.milestoneId,
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
      fetchContract(contractID);
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
  const allMilestonesCompleted = contract?.milestones.every(
    (milestone) => milestone.status === "payment_released"
  );

  // Show complete button only for active contracts with all milestones completed
  const showCompleteButton =
    contract?.status === "active" &&
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
      fetchContract(contractID);
      toast({
        title: "Successfully started working on the contract",
        description: "You can now start working on the contract",
        variant: "default",
      });
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

  const handleStartMilestoneWorking = async (milestone: any) => {
    setStartingWork(true);
    try {
      const response = await axios.patch("/api/manage-milestone-status", {
        contractId: contract?.contractId,
        milestoneId: milestone.milestoneId,
        newStatus: "working",
        customerId: user?._id,
        userType: user?.userType,
      });

      if (response.data) {
        fetchContract(contractID);
        toast({
          title: "Success",
          description: "Started working on milestone successfully",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error starting milestone work:", error);
      toast({
        title: "Error",
        description: "Failed to start working on milestone. Please try again.",
        variant: "destructive",
      });
    } finally {
      setStartingWork(false);
    }
  };

  return (
    <>
      {isAdmin === false && (
        <Topbar
          title={
            contract?.title && contract.title.length > 30
              ? contract.title.slice(0, 30) + "..."
              : contract?.title || "Graphic Designing"
          }
          description="Contract Details and Information"
        />
      )}
      {loading ? (
        <Loader size="lg" text="Loading contract details..." />
      ) : (
        <div
          className={`flex-1 ${
            isAdmin === false ? "mt-[85px]" : "mt-0"
          } w-full`}
        >
          <div className="flex lg:flex-row flex-col justify-between gap-6 lg:gap-0 w-full">
            <div className="flex flex-col gap-6 w-full max-w-3xl">
              <div className="flex sm:justify-between items-center flex-wrap-reverse">
                <h2 className="text-paragraph dark:text-white text-heading3-bold break-words w-[75%]">
                  {contract?.title || "Graphic Designing"}
                </h2>
                {isAdmin === false &&
                  contract?.status === "onboarding" &&
                  user?.userType === "vendor" && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="text-base-medium text-white rounded-[12px]"
                        onClick={() => handleAction("reject")}
                      >
                        Reject
                      </Button>
                      <Button
                        className="text-base-medium text-white rounded-[12px]"
                        onClick={() => handleAction("accept")}
                      >
                        Accept
                      </Button>
                    </div>
                  )}
                {isAdmin === false && showCompleteButton && (
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
                {isAdmin === false &&
                  user?.userType === "client" &&
                  (contract?.status === "funding_pending" ||
                    contract?.status === "funding_processing") && (
                    <Button
                      variant="default"
                      onClick={() =>
                        router.push(`/make-payment/${contract?.contractId}`)
                      }
                      className="bg-secondary hover:bg-secondary/90 text-white rounded-[9px] px-4 py-2 hover:underline transition-colors duration-200"
                    >
                      Make Payment
                    </Button>
                  )}

                {isAdmin === false &&
                  user?.userType === "vendor" &&
                  contract?.status === "funding_onhold" && (
                    <Button
                      variant="default"
                      className="bg-primary hover:bg-primary/90 text-white rounded-[9px] px-4 py-2 hover:underline transition-colors duration-200"
                      onClick={handleStartWorking}
                      disabled={startingWork}
                    >
                      {startingWork ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Starting...
                        </div>
                      ) : (
                        "Start Working"
                      )}
                    </Button>
                  )}
              </div>
              <div className="border-b border-[#D0D0D04D] dark:border-dark-border pb-6">
                <p className="text-sm text-paragraph dark:text-dark-2 text-small-medium font-[400]">
                  Contract ID: {contract?.contractId}
                </p>
                <p className="mt-2 text-paragraph dark:text-dark-text text-base-regular w-full break-words">
                  {contract?.description}
                </p>
                {contract?.contractFile && contract.contractFile.length > 0 && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={() => setIsFilePreviewOpen(true)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      variant="ghost"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View contract files ({contract.contractFile.length})
                    </Button>
                  </div>
                )}
              </div>
              <div className="border-b border-[#D0D0D04D] dark:border-dark-border pb-6 flex justify-between">
                <div className="flex flex-col gap-1 text-paragraph dark:text-dark-text text-base-regular">
                  <div className="flex items-center gap-2">
                    <p className="">Duration:</p>
                    <p className="">
                      {getDuration(contract?.startDate, contract?.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>Project Cost:</p>
                    <p className="">${contract?.budget?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>Start Date:</p>
                    <p className="">{formatDate(contract?.startDate || "")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>End Date:</p>
                    <p className="">{formatDate(contract?.endDate || "")}</p>
                  </div>
                </div>

                <Link href={`/transection-details/${contract?._id}`}>
                  {isAdmin === false && contract?.status !== "onboarding" && (
                    <Button className="text-[14px] font-[700] leading-[20px] bg-primary text-white dark:bg-primary dark:text-dark-text px-2 md:px-6 rounded-lg hover:bg-primary-500 dark:hover:bg-primary-500 transition-colors md:h-[46px] h-[36px]">
                      Payment History
                    </Button>
                  )}
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
                      milestone.status === "approved" ||
                      milestone.status === "payment_released"
                        ? "bg-primary"
                        : "bg-paragraph dark:bg-dark-2"
                    } absolute left-[0px] top-1`}
                  ></div>
                  <div
                    className={`absolute left-[5px] top-2 bottom-0 w-[2px]  ${
                      milestone.status === "approved" ||
                      milestone.status === "payment_released"
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
                        {isAdmin === false &&
                          ((milestone.status !== "pending" &&
                            milestone.status !== "working" &&
                            user?.userType === "vendor") ||
                            (milestone.status === "payment_released" &&
                              user?.userType === "client")) && (
                            <button
                              onClick={() => {
                                setMileStoneData(milestone);
                                setIsWorkModalOpen(true);
                              }}
                              className="text-primary underline text-[12px] font-[600] leading-[19px]"
                            >
                              View Submitted Work
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1">
                    <ul className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-paragraph dark:bg-dark-2 mt-2"></span>
                        <li className="text-paragraph dark:text-dark-text text-[14px] font-[400] leading-[19px] break-words w-full">
                          {milestone.description}
                        </li>
                      </div>
                    </ul>
                  </div>
                </div>
                {milestone?.status !== "cancelled" &&
                  milestone?.status !== "pending" && (
                    <div className="mt-4 md:mt-0 flex justify-end">
                      {contract?.status !== "onboarding" &&
                      user?.userType === "vendor" ? (
                        <>
                          {isAdmin === false &&
                            milestone.status !== "approved" &&
                            milestone.status !== "payment_released" && (
                              <Button
                                onClick={() => {
                                  router.push(
                                    `/milestone-submission/${
                                      milestone.milestoneId
                                    }/${contract?._id}/${encodeURIComponent(
                                      milestone.title
                                    )}/${contractID}`
                                  );
                                }}
                                className={`text-[14px] font-[700] leading-[20px] ${
                                  milestone.status === "change_requested" ||
                                  milestone.status === "working"
                                    ? "bg-primary hover:bg-primary-500 dark:bg-primary dark:hover:bg-primary-500 dark:text-dark-text"
                                    : "bg-[#CACED8] hover:bg-[#CACED8]/90 dark:bg-[#CACED8] dark:hover:bg-[#CACED8]/90 dark:text-white"
                                } text-white px-6 md:px-10 rounded-lg transition-colors md:h-[46px] h-[36px] `}
                                disabled={
                                  milestone?.status !== "working" &&
                                  milestone.status !== "change_requested"
                                }
                              >
                                {"Submit Work"}
                              </Button>
                            )}
                        </>
                      ) : (
                        <>
                          {isAdmin === false &&
                            milestone.status !== "payment_released" && (
                              <Button
                                onClick={() => {
                                  setMileStoneData(milestone);
                                  setIsWorkModalOpen(true);
                                }}
                                className={`text-[14px] font-[700] leading-[20px] ${
                                  milestone.status === "ready_for_review" ||
                                  milestone.status === "change_requested" ||
                                  milestone.status === "approved"
                                    ? "bg-primary hover:bg-primary-500 dark:bg-primary dark:hover:bg-primary-500 dark:text-dark-text"
                                    : "bg-[#CACED8] hover:bg-[#CACED8]/90 dark:bg-[#CACED8] dark:hover:bg-[#CACED8]/90 dark:text-white"
                                } text-white px-6 md:px-10 rounded-lg transition-colors md:h-[46px] h-[36px]`}
                                disabled={
                                  milestone.status !== "ready_for_review" &&
                                  milestone.status !== "change_requested" &&
                                  milestone.status !== "approved"
                                }
                              >
                                {milestone.status === "approved"
                                  ? "Release Payment"
                                  : "Ready for Review"}
                              </Button>
                            )}
                        </>
                      )}
                    </div>
                  )}
                {isAdmin === false &&
                  user?.userType === "vendor" &&
                  milestone?.status === "pending" &&
                  (contract?.milestones[index - 1]?.status ===
                    "payment_released" ||
                    contract?.milestones[index - 1]?.status === "approved") && (
                    <div className="mt-4 md:mt-0 flex justify-end">
                      <Button
                        onClick={() => {
                          if (
                            contract?.milestones[index - 1]?.status ===
                            "payment_released"
                          ) {
                            handleStartMilestoneWorking(milestone);
                          }
                        }}
                        disabled={startingWork}
                        className={`text-[14px] font-[700] leading-[20px] ${
                          contract?.milestones[index - 1]?.status ===
                          "payment_released"
                            ? "bg-primary hover:bg-primary-500 dark:bg-primary dark:hover:bg-primary-500 dark:text-dark-text"
                            : "bg-[#CACED8] hover:bg-[#CACED8]/90 dark:bg-[#CACED8] dark:hover:bg-[#CACED8]/90 dark:text-white"
                        } text-white px-6 md:px-10 rounded-lg transition-colors md:h-[46px] h-[36px] `}
                      >
                        {startingWork ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Starting...
                          </div>
                        ) : contract?.milestones[index - 1]?.status ===
                          "approved" ? (
                          "Waiting for Client Payment"
                        ) : (
                          "Start Working"
                        )}
                      </Button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      <WorkSubmissionModal
        mileStoneData={{ ...mileStoneData, contractId: contract?._id }}
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        fetchContract={() => fetchContract(contractID)}
        contractId={contractID}
      />
      <RevisionRequestModal
        mileStoneData={{ ...mileStoneData, contractId: contract?._id }}
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        fetchContract={() => fetchContract(contractID)}
      />
      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        files={
          contract?.contractFile && Array.isArray(contract.contractFile)
            ? convertS3FilesToPreviewFiles(
                contract.contractFile as unknown as any
              )
            : []
        }
        isDownloadable={true}
        onDownload={(file) => handleFileDownload(file, toast)}
      />
    </>
  );
};

export default ContactDetails;
