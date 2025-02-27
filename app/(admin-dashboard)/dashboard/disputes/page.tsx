"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/helpers/fromatDate";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import DisputeDetailsModal from "@/components/modals/DisputeDetailsModal";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/dashboard/Pagination";
import { getStatusClass } from "@/lib/helpers/getStatusColor";

interface Dispute {
  _id: string;
  disputeId: string;
  contractId: {
    _id: string;
    title: string;
    contractId: string;
  };
  raisedBy: {
    _id: string;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
  raisedTo: {
    _id: string;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
  title: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  chat: {
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
  };
}

interface Stats {
  active: number;
  resolved: number;
  amountInDispute: number;
  resolutionRate: number;
}

const DisputesPage = () => {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage] = useState(10);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: statusFilter,
        search: debouncedSearchTerm,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/get-all-disputes?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setDisputes(data.data.disputes);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        throw new Error(data.error || "Failed to fetch disputes");
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch disputes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (dispute: Dispute) => {
    let disputeId = dispute?.contractId?.contractId;
    const userId = dispute?.raisedBy?._id;
    setSelectedDispute(disputeId);
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };

  const handleGoToChat = (disputeId: string) => {
    router.push(`/dashboard/dispute-chat/?disputeId=${disputeId}`);
  };

  const handleStatusUpdate = async (disputeId: string, currentStatus: string) => {
    if (processingStatus) return;
    
    setProcessingStatus(disputeId);
    try {
      const response = await fetch('/api/update-dispute-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disputeId,
          newStatus: currentStatus === 'pending' ? 'process' : 'resolved'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Dispute status updated successfully",
        });
        fetchDisputes(); // Refresh the list
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setProcessingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disputes Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading2-bold text-main-heading dark:text-dark-text">Disputes</h1>
          <p className="text-base-regular text-dark-2">Manage and resolve project disputes</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search by project title, dispute title, or dispute ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-[200px] dark:bg-dark-input-bg dark:text-dark-text"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary dark:focus:border-primary [&>option]:bg-white [&>option]:dark:bg-dark-bg [&>option]:dark:text-dark-text"
          >
            <option value="all" className="text-paragraph dark:text-dark-text">All Status</option>
            <option value="pending" className="text-paragraph dark:text-dark-text">Pending</option>
            <option value="process" className="text-paragraph dark:text-dark-text">In Process</option>
            <option value="resolved" className="text-paragraph dark:text-dark-text">Resolved</option>
          </select>
        </div>
      </div>

      {/* Dispute Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Active Disputes</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">{stats?.active || 0}</p>
          <p className="text-small-regular text-error-text">Requires attention</p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Resolved</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">{stats?.resolved || 0}</p>
          <p className="text-small-regular text-success-text">This year</p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Amount in Dispute</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            ${stats?.amountInDispute.toLocaleString() || 0}
          </p>
          <p className="text-small-regular text-dark-2 dark:text-dark-text/60">
            Across {stats?.active || 0} projects
          </p>
        </div>
        <div className="bg-white dark:bg-dark-input-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
          <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Resolution Rate</h3>
          <p className="text-heading3-bold text-main-heading dark:text-dark-text">{stats?.resolutionRate || 0}%</p>
          <p className="text-small-regular text-dark-2 dark:text-dark-text/60">Last 30 days</p>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
        <div className="p-6 border-b border-sidebar-border dark:border-dark-border">
          <h2 className="text-heading3-bold text-main-heading dark:text-dark-text">Active Disputes</h2>
        </div>

        {loading ? (
          <div className="p-8">
            <Loader size="lg" text="Loading disputes..." />
          </div>
        ) : disputes.length === 0 ? (
          <div className="p-8 text-center text-dark-2 dark:text-dark-text/60">
            No disputes found
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {disputes.map((dispute) => (
              <div
                key={dispute._id}
                className="border border-sidebar-border dark:border-dark-border rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base-semibold text-paragraph dark:text-dark-text">
                      {dispute.contractId.title}
                    </h3>
                    <p className="text-small-regular text-dark-2 dark:text-dark-text/60">
                      Dispute ID: {dispute.disputeId}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-small-medium rounded-full ${getStatusClass(dispute.status)}`}>
                    {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-small-medium text-dark-2 dark:text-dark-text/60">Raised By</p>
                    <p className="text-base-regular text-paragraph dark:text-dark-text">
                      {dispute.raisedBy.userName}
                    </p>
                    <p className="text-small-regular text-dark-2 dark:text-dark-text/60 capitalize">
                      {dispute.raisedBy.userType}
                    </p>
                  </div>
                  <div>
                    <p className="text-small-medium text-dark-2 dark:text-dark-text/60">Raised To</p>
                    <p className="text-base-regular text-paragraph dark:text-dark-text">
                      {dispute.raisedTo.userName}
                    </p>
                    <p className="text-small-regular text-dark-2 dark:text-dark-text/60 capitalize">
                      {dispute.raisedTo.userType}
                    </p>
                  </div>
                  <div>
                    <p className="text-small-medium text-dark-2 dark:text-dark-text/60">Last Activity</p>
                    <p className="text-base-regular text-paragraph dark:text-dark-text">
                      {dispute.chat.lastMessageAt 
                        ? formatDate(dispute.chat.lastMessageAt)
                        : "No activity"}
                    </p>
                    {dispute.chat.unreadCount > 0 && (
                      <p className="text-small-regular text-error-text">
                        {dispute.chat.unreadCount} unread messages
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="bg-muted dark:bg-dark-input-bg p-4 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-small-medium text-dark-2 dark:text-dark-text/60">Project Title</p>
                      <p className="text-base-semibold text-paragraph dark:text-dark-text break-all">
                        {dispute.contractId.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-small-medium text-dark-2 dark:text-dark-text/60">Dispute Title</p>
                      <p className="text-base-semibold text-paragraph dark:text-dark-text break-all">
                        {dispute.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dispute Reason */}
                <div className="bg-muted dark:bg-dark-input-bg p-4 rounded-lg">
                  <p className="text-small-medium text-dark-2 dark:text-dark-text/60">Dispute Reason</p>
                  <p className="text-base-regular text-paragraph dark:text-dark-text break-all">
                    {dispute.reason}
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  {dispute.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(dispute._id, dispute.status)}
                      disabled={processingStatus === dispute._id}
                      className="text-success-text hover:text-success-text/80 hover:bg-success-bg"
                    >
                      {processingStatus === dispute._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-success-text border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Start Processing"
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(dispute)}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    View Details
                  </Button>
                  <Button
                    disabled={dispute.status==='pending'}
                    onClick={() => handleGoToChat(dispute._id)}
                    className="bg-primary hover:bg-primary/90 text-white dark:text-dark-text flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Go to Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && disputes.length > 0 && (
          <div className="p-4 border-t border-sidebar-border dark:border-dark-border">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <DisputeDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedDispute(null);
          }}
          contractId={selectedDispute}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

export default DisputesPage; 