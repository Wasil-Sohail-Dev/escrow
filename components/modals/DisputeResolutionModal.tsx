import React from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { CheckCircle, XCircle, Award } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface ResolutionData {
  status: "resolved" | "rejected";
  winner?: "client" | "vendor";
  reason: string;
}

interface DisputeResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ResolutionData) => Promise<void>;
  isSubmitting: boolean;
}

const DisputeResolutionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: DisputeResolutionModalProps) => {
  const { toast } = useToast();
  const [resolutionData, setResolutionData] = React.useState<ResolutionData>({
    status: "resolved",
    winner: undefined,
    reason: "",
  });

  const handleSubmit = async () => {
    // Validate required fields
    if (!resolutionData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a resolution reason",
        variant: "destructive",
      });
      return;
    }

    // If resolving, winner must be selected
    if (resolutionData.status === "resolved" && !resolutionData.winner) {
      toast({
        title: "Error",
        description: "Please select a winning party",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(resolutionData);
    } catch (error) {
      console.error("Error submitting resolution:", error);
      toast({
        title: "Error",
        description: "Failed to submit resolution",
        variant: "destructive",
      });
    }
  };

  // Reset form when modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setResolutionData({
        status: "resolved",
        winner: undefined,
        reason: "",
      });
    }
  }, [isOpen]);

  const handleStatusChange = (newStatus: "resolved" | "rejected") => {
    setResolutionData(prev => ({
      ...prev,
      status: newStatus,
      // Clear winner if rejecting
      winner: newStatus === "rejected" ? undefined : prev.winner,
    }));
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-[500px] p-10">
        <div>
          <ModalTitle className="text-2xl font-medium dark:text-dark-text">Resolve Dispute</ModalTitle>
          <p className="text-sm text-gray-500 dark:text-dark-text/60">
            Please provide the resolution details for this dispute.
          </p>
        </div>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium dark:text-dark-text">Resolution Type</Label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant={resolutionData.status === "resolved" ? "default" : "outline"}
                onClick={() => handleStatusChange("resolved")}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </Button>
              <Button
                type="button"
                variant={resolutionData.status === "rejected" ? "default" : "outline"}
                onClick={() => handleStatusChange("rejected")}
                className="flex items-center gap-2 dark:text-dark-text"
                disabled={isSubmitting}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </div>

          {resolutionData.status === "resolved" && (
            <div className="space-y-2 dark:text-dark-text">
              <Label>Select Winner</Label>
              <RadioGroup
                value={resolutionData.winner}
                onValueChange={(value: "client" | "vendor") => 
                  setResolutionData(prev => ({ ...prev, winner: value }))
                }
                className="flex flex-col space-y-2"
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    Client Wins
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vendor" id="vendor" />
                  <Label htmlFor="vendor" className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    Vendor Wins
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2 dark:text-dark-text">
            <Label>Resolution Reason</Label>
            <Textarea
              value={resolutionData.reason}
              onChange={(e) => setResolutionData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide a detailed explanation for your decision..."
              className="min-h-[100px] dark:bg-dark-input-bg"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[#E3E3E3] dark:border-dark-border dark:text-dark-text">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white dark:text-dark-text flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              <>
                {resolutionData.status === "resolved" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {resolutionData.status === "resolved" ? "Resolve" : "Reject"} Dispute
              </>
            )}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default DisputeResolutionModal; 