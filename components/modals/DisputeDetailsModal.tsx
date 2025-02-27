import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { MessageCircle, Eye } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/ui/loader";
import { formatDate } from "@/lib/helpers/fromatDate";
import FilePreviewModal from "./FilePreviewModal";
import { FilePreviewType, S3File, convertS3FilesToPreviewFiles, handleFileDownload } from "@/lib/helpers/fileHelpers";
import { useToast } from "@/hooks/use-toast";
import { getStatusClass } from "@/lib/helpers/getStatusColor";

interface DisputeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  userId?: string | null;
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
  files: S3File[];
  chat: {
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
  };
}

const DisputeDetailsModal = ({ isOpen, onClose, contractId, userId }: DisputeDetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [disputeDetails, setDisputeDetails] = useState<DisputeDetails | null>(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const customerId=userId ? userId : user?._id;

  const fetchDisputeDetails = async () => {
    if (!contractId || !customerId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/get-dispute-contractId?contractId=${contractId}&customerId=${customerId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setDisputeDetails(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch dispute details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dispute details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contractId) {
      fetchDisputeDetails();
    } else {
      // Reset state when modal closes
      setDisputeDetails(null);
    }
  }, [isOpen, contractId, user?._id,userId]);

  const handleGoToChat = () => {
    if (disputeDetails?._id) {
      router.push(`/dispute-chat/?disputeId=${disputeDetails._id}`);
      onClose();
    }
  };

  return (
    <>
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
            <div className="space-y-6 p-4  overflow-y-auto max-h-[calc(80vh-100px)]">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-dark-text/60">Dispute ID</p>
                  <p className="font-mono text-lg font-medium text-paragraph dark:text-dark-text">
                    {disputeDetails.disputeId}
                  </p>
                </div>
                <span className={`px-3 py-1 text-small-medium rounded-full ${getStatusClass(disputeDetails.status)}`}>
                    {disputeDetails.status.charAt(0).toUpperCase() + disputeDetails.status.slice(1)}
                  </span>
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
                  <p className="font-medium mt-1 text-paragraph dark:text-dark-text break-all">
                    {disputeDetails.title}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text/60">Reason</p>
                  <p className="mt-1 text-paragraph dark:text-dark-text break-all">
                    {disputeDetails.reason}
                  </p>
                </div>

                {/* Files Section */}
                {disputeDetails.files && disputeDetails.files.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-dark-text/60 mb-2">Attached Files</p>
                    <Button
                      type="button"
                      onClick={() => setIsFilePreviewOpen(true)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      variant="ghost"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View files ({disputeDetails.files.length})
                    </Button>
                  </div>
                )}
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

      {/* File Preview Modal */}
      {disputeDetails && (
        <FilePreviewModal
          isOpen={isFilePreviewOpen}
          onClose={() => setIsFilePreviewOpen(false)}
          files={convertS3FilesToPreviewFiles(disputeDetails.files)}
          isDownloadable={true}
          onDownload={(file) => handleFileDownload(file, toast)}
        />
      )}
    </>
  );
};

export default DisputeDetailsModal; 