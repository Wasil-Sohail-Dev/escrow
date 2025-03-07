"use client";
import React, { useState, useEffect } from "react";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import Image from "next/image";
import AddMilestoneModal from "./AddMilestoneModal";
import axios from "axios";
import Loader from "@/components/ui/loader";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/helpers/fromatDate";
import RevisionRequestModal from "./RevisionRequestModal";
import FilePreviewModal from "./FilePreviewModal";
import { S3File, convertS3FilesToPreviewFiles, handleFileDownload } from "@/lib/helpers/fileHelpers";
import { useMilestoneTask } from '@/contexts/MilestoneTaskContext';

interface HistoryEntry {
  _id: string;
  milestoneId: string;
  contractId: string;
  action: string;
  files: S3File[];
  title: string;
  description: string;
  userRole: string;
  timestamp: string;
}

interface WorkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchContract: () => void;
  mileStoneData: any;
  contractId: string;
}


const WorkSubmissionModal = ({
  isOpen,
  onClose,
  mileStoneData,
  fetchContract,
  contractId,
}: WorkSubmissionModalProps) => {
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneHistory, setMilestoneHistory] = useState<{
    data: HistoryEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [releasingPayment, setReleasingPayment] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<S3File[]>([]);
  const { user } = useUser();
  const { toast } = useToast();
  const { handleMilestoneAction } = useMilestoneTask();

  const fetchMilestoneHistory = async () => {
    if (mileStoneData?.milestoneId) {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `/api/get-milestone-history?milestoneId=${mileStoneData.milestoneId}`
        );
        console.log("Milestone History:", data);
        setMilestoneHistory(data);
      } catch (error) {
        console.error("Error fetching milestone history:", error);
        toast({
          title: "Error",
          description: "Failed to fetch milestone history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && mileStoneData?.milestoneId) {
      fetchMilestoneHistory();
    }
  }, [isOpen, mileStoneData?.milestoneId]);

  const handleRevisionModalOpen = () => {
    setIsRevisionOpen(true);
  };

  const handleRevisionModalClose = () => {
    setIsRevisionOpen(false);
    // Refresh the history after revision modal closes
    fetchMilestoneHistory();
  };

  const handleApproveMilestone = async () => {
    setApproving(true);
    try {
      await handleMilestoneAction({
        contractId: mileStoneData.contractId,
        milestoneId: mileStoneData.milestoneId,
        action: "client_approved",
        userId: user?._id || "",
        title: "Milestone Approval",
        description: "Client has approved the milestone",
        userRole: user?.userType || "",
        onSuccess: () => {
          fetchContract();
          onClose();
        }
      });
    } catch (error) {
      // Error is already handled by the context
    } finally {
      setApproving(false);
    }
  };

  const handleReleasePayment = async () => {
    setReleasingPayment(true);
    try {
      const response = await axios.post("/api/payment-release", {
        contractId: contractId,
        milestoneId: mileStoneData.milestoneId,
        clientId: user?._id,
      });
console.log(response.data.success,"successssssssss");


      if (response.data.success) {
        setTimeout(() => {
          fetchContract();
        }, 2000);
        toast({
          title: "Success",

          description: "Payment released successfully",
          variant: "default",
        });
        onClose();
      } else {
        throw new Error(response.data.error || "Failed to release payment");
      }
    } catch (error: any) {
      console.error("Error releasing payment:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          "Failed to release payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReleasingPayment(false);
    }
  };

  const handleViewFiles = (files: S3File[]) => {
    setSelectedFiles(files);
    setIsFilePreviewOpen(true);
  };

  return (
    <>
      <Modal open={isOpen} onOpenChange={onClose}>
        <ModalContent className="w-[95%] max-w-[547px] px-4 md:px-6 rounded-lg">
          <ModalHeader>
            <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-4">
              Work Submitted By Vendor
            </ModalTitle>
          </ModalHeader>
          {loading ? (
            <Loader size="md" text="Loading milestone history..." />
          ) : (
            <div className="space-y-4 mt-5">
              {user?.userType !== "vendor" && (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[500] dark:text-dark-text">
                        Progress Status:
                      </span>
                      <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[400] text-paragraph dark:text-dark-text/60">
                        On Going
                      </span>
                      <Image
                        src="/assets/worksubmition.svg"
                        alt="info"
                        width={15}
                        height={15}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      className={`mt-2 text-[12px] sm:text-[13px] md:text-[14px] font-[700] leading-[19px] h-[36px] sm:h-[38px] md:h-[42px] ${
                        mileStoneData?.status === "approved"
                          ? "bg-primary hover:bg-primary-500 dark:bg-primary dark:hover:bg-primary-500 dark:text-dark-text"
                          : "bg-[#CACED8] hover:bg-[#CACED8]/90 dark:bg-dark-input-bg text-white dark:text-dark-text"
                      }`}
                      disabled={
                        mileStoneData?.status !== "approved" || releasingPayment
                      }
                      onClick={handleReleasePayment}
                    >
                      {releasingPayment ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Releasing...
                        </div>
                      ) : (
                        "Release Payment"
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 -mt-2">
                    <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[500] dark:text-dark-text">
                      Payment Status:
                    </span>
                    <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[400] text-paragraph dark:text-dark-text/60">
                      With held
                    </span>
                    <Image
                      src="/assets/worksubmition.svg"
                      alt="info"
                      width={15}
                      height={15}
                      className="mt-1 ml-1"
                    />
                  </div>
                </div>
              )}

              {milestoneHistory?.data && milestoneHistory.data.length > 0 && (
                <div className="pt-4 pb-8">
                  <h3 className="text-[16px] sm:text-[18px] md:text-[19px] font-[700] leading-[27px] mb-4 dark:text-dark-text">
                    Milestone History
                  </h3>
                  <div className="space-y-4 overflow-y-auto max-h-[300px]">
                    {milestoneHistory.data.map((history) => (
                      <div
                        key={history._id}
                        className="border dark:border-dark-border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-[14px] font-[600] dark:text-dark-text">
                              {history.title}
                            </h4>
                            <p className="text-[12px] text-paragraph dark:text-dark-text/60">
                              {history.userRole.charAt(0).toUpperCase() +
                                history.userRole.slice(1)}{" "}
                              {history.action.replace("_", " ")}
                            </p>
                          </div>
                          <span className="text-[12px] text-paragraph dark:text-dark-text/60">
                            {formatDate(history.timestamp)}
                          </span>
                        </div>
                        <p className="text-[13px] text-paragraph dark:text-dark-text/80 mt-2">
                          {history.description}
                        </p>
                        {history.files.length > 0 && (
                          <div className="mt-4">
                            <Button
                              type="button"
                              onClick={() => handleViewFiles(history.files)}
                              className="text-primary hover:text-primary/80 hover:bg-primary/10"
                              variant="ghost"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View files ({history.files.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user?.userType !== "vendor" &&
                mileStoneData?.status !== "approved" &&
                mileStoneData?.status !== "payment_released" && (
                  <div className="flex items-end  justify-end gap-3 mt-6 border-t border-[#E3E3E3] pt-6">
                    <Button
                      onClick={handleRevisionModalOpen}
                      disabled={
                        approving ||
                        milestoneHistory?.data[0]?.action ===
                          "client_requested_changes"
                      }
                      className="bg-white hover:bg-white/90 hover:text-white hover:bg-primary text-black border-2 border-primary dark:bg-dark-input-bg dark:text-dark-text dark:border-primary text-[12px] sm:text-[13px] md:text-[14px] font-[600] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
                    >
                      Request revision
                    </Button>
                    <Button
                      onClick={handleApproveMilestone}
                      disabled={
                        approving ||
                        milestoneHistory?.data[0]?.action ===
                          "client_requested_changes"
                      }
                      className="bg-white hover:bg-white/90 hover:text-white hover:bg-primary text-black border-2 border-primary dark:bg-dark-input-bg dark:text-dark-text dark:border-primary text-[12px] sm:text-[13px] md:text-[14px] font-[600] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
                    >
                      {approving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Approving...
                        </div>
                      ) : (
                        "Approve MileStone"
                      )}
                    </Button>
                  </div>
                )}
            </div>
          )}
        </ModalContent>
      </Modal>

      <AddMilestoneModal
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
      />

      <RevisionRequestModal
        isOpen={isRevisionOpen}
        onClose={handleRevisionModalClose}
        mileStoneData={mileStoneData}
        fetchContract={fetchContract}
      />

      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        files={convertS3FilesToPreviewFiles(selectedFiles)}
        isDownloadable={true}
        onDownload={(file) => handleFileDownload(file, toast)}
      />
    </>
  );
};

export default WorkSubmissionModal;
