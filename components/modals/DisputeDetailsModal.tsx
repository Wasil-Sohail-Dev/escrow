import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/ui/loader";
import { formatDate } from "@/lib/helpers/fromatDate";

interface DisputeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
}

interface DisputeDetails {
  _id: string;
  contractId: {
    _id: string;
    contractId: string;
    title: string;
  };
  milestoneId: string;
  raisedBy: {
    _id: string;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
    userName: string;
  };
  raisedTo: {
    _id: string;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
    userName: string;
  };
  title: string;
  reason: string;
  status: string;
  disputeId: string;
  createdAt: string;
  updatedAt: string;
  chat: {
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
  };
}

const DisputeDetailsModal = ({ isOpen, onClose, contractId }: DisputeDetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [disputeDetails, setDisputeDetails] = useState<DisputeDetails | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const fetchDisputeDetails = async () => {
    if (!contractId || !user?._id) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/get-dispute-contractId?contractId=${contractId}&customerId=${user._id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setDisputeDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching dispute details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contractId) {
      fetchDisputeDetails();
    }
  }, [isOpen, contractId]);

  const handleGoToChat = () => {
    if (disputeDetails?._id) {
      router.push(`/dispute-chat/?disputeId=${disputeDetails._id}`);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-500";
      case "resolved":
        return "text-green-500";
      default:
        return "text-red-500";
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[700px] px-4 md:px-6 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[20px] sm:text-[24px] font-semibold dark:text-dark-text border-b border-[#E3E3E3] dark:border-dark-border pb-4">
            Dispute Details
          </ModalTitle>
        </ModalHeader>

        {loading ? (
          <div className="py-8">
            <Loader size="md" text="Loading dispute details..." />
          </div>
        ) : disputeDetails ? (
          <div className="space-y-6 py-4 overflow-y-auto max-h-[calc(80vh-100px)]">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Dispute ID</p>
                <p className="font-mono text-lg font-medium text-paragraph dark:text-dark-text">
                  {disputeDetails.disputeId}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                disputeDetails.status.toLowerCase() === "pending" 
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                  : disputeDetails.status.toLowerCase() === "resolved"
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
              }`}>
                {disputeDetails.status}
              </div>
            </div>

            {/* Project Details */}
            <div className="rounded-lg border border-[#E3E3E3] dark:border-dark-border p-4 space-y-4 bg-gray-50 dark:bg-dark-input-bg">
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Project Title</p>
                <h3 className="text-lg font-semibold mt-1 text-paragraph dark:text-dark-text">
                  {disputeDetails.contractId.title}
                </h3>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Dispute Title</p>
                <p className="font-medium mt-1 text-paragraph dark:text-dark-text">
                  {disputeDetails.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Reason</p>
                <p className="mt-1 text-paragraph dark:text-dark-text whitespace-pre-wrap">
                  {disputeDetails.reason}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Raised By</p>
                <div>
                  <p className="font-medium text-paragraph dark:text-dark-text">
                    {disputeDetails.raisedBy.userName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-text/60 capitalize">
                    {disputeDetails.raisedBy.userType}
                  </p>
                </div>
              </div>
              <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Raised To</p>
                <div>
                  <p className="font-medium text-paragraph dark:text-dark-text">
                    {disputeDetails.raisedTo.userName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-text/60 capitalize">
                    {disputeDetails.raisedTo.userType}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Created Date</p>
                <p className="font-medium text-paragraph dark:text-dark-text">
                  {formatDate(disputeDetails.createdAt)}
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-lg border border-[#E3E3E3] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
                <p className="text-sm text-gray-500 dark:text-dark-text/60">Last Activity</p>
                <p className="font-medium text-paragraph dark:text-dark-text">
                  {disputeDetails.chat.lastMessageAt 
                    ? formatDate(disputeDetails.chat.lastMessageAt) 
                    : "No activity"}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-4 border-t border-[#E3E3E3] dark:border-dark-border mt-6">
              <Button
                onClick={handleGoToChat}
                className="bg-primary hover:bg-primary/90 text-white dark:text-dark-text flex items-center gap-2 h-11"
              >
                <MessageCircle size={18} />
                Go to Chat
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-dark-text/60">
            No dispute details found
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DisputeDetailsModal; 