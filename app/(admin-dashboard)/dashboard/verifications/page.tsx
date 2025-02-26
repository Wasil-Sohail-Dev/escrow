"use client"

import { useState, useEffect } from 'react';
import { useAdmin } from '@/components/providers/AdminProvider';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import Pagination from '@/components/dashboard/Pagination';
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";

type UserType = 'vendor' | 'client';
type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

interface KYCDocument {
  fileUrl: string;
  fileName: string;
  fileType: string;
  documentType: string;
  uploadedAt: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  userType: UserType;
}

interface KYC {
  _id: string;
  customerId: Customer;
  documents: KYCDocument[];
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectionReason?: string;
}

interface Stats {
  [key: string]: {
    pending: number;
    approved: number;
    rejected: number;
    revoked: number;
    approvedToday: number;
    rejectedToday: number;
    responseTime: number;
  };
}

export default function VerificationsPage() {
  const { user } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<UserType>('vendor');
  const [selectedKYC, setSelectedKYC] = useState<KYC | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycs, setKycs] = useState<KYC[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewNotes, setReviewNotes] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<KYCDocument | null>(null);
  console.log(user,"user");
  

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchKYCs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        userType: activeTab,
        status: statusFilter,
        search: debouncedSearchTerm,
        page: currentPage.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/get-kyc?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setKycs(data.data.kycs);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        throw new Error(data.error || "Failed to fetch KYC data");
      }
    } catch (error) {
      console.error("Error fetching KYCs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch verifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCs();
  }, [activeTab, statusFilter, debouncedSearchTerm, currentPage]);

  // Clear selected verification on tab change
  useEffect(() => {
    setSelectedKYC(null);
  }, [activeTab]);

  const handleVerificationAction = async (kycId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return;

    try {
      setProcessingAction(true);
      const response = await fetch('/api/update-kyc-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kycId,
          status: action === 'approve' ? 'approved' : 'rejected',
          adminId: user.id,
          reason: action === 'reject' ? reviewNotes : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} verification`);
      }

      toast({
        title: "Success",
        description: `Verification ${action}ed successfully`,
      });

      // Refresh data
      fetchKYCs();
      setSelectedKYC(null);
      setReviewNotes("");
    } catch (error: any) {
      console.error(`Error ${action}ing verification:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} verification`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading2-bold text-main-heading dark:text-dark-text">Verifications</h1>
            <p className="text-base-regular text-dark-2">Review and process KYC submissions</p>
          </div>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[200px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-sm text-paragraph dark:text-dark-text focus:outline-none focus:border-primary dark:focus:border-primary [&>option]:bg-white [&>option]:dark:bg-dark-bg [&>option]:dark:text-dark-text"
          >
            <option value="all" className="text-paragraph dark:text-dark-text">
              All Status
            </option>
            <option value="pending" className="text-paragraph dark:text-dark-text">
              Pending
            </option>
            <option value="approved" className="text-paragraph dark:text-dark-text">
              Approved
            </option>
            <option value="rejected" className="text-paragraph dark:text-dark-text">
              Rejected
            </option>
            <option value="revoked" className="text-paragraph dark:text-dark-text">
              Revoked
            </option>
          </select>
        </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-sidebar-border dark:border-dark-border">
          <button
            onClick={() => setActiveTab('vendor')}
            className={`px-4 py-2 text-base-medium ${
              activeTab === 'vendor'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark-2 hover:text-primary'
            }`}
          >
            Vendor Verifications
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-4 py-2 text-base-medium ${
              activeTab === 'client'
                ? 'text-primary border-b-2 border-primary'
                : 'text-dark-2 hover:text-primary'
            }`}
          >
            Client Verifications
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
            <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Pending Reviews</h3>
            <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {stats?.[activeTab].pending || 0}
            </p>
            <p className="text-small-regular text-error-text">Requires attention</p>
          </div>
          <div className="bg-white dark:bg-dark-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
            <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Approved Today</h3>
            <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {stats?.[activeTab].approvedToday || 0}
          </p>
          <p className="text-small-regular text-success-text">
            {((stats?.[activeTab]?.approvedToday ?? 0) - (stats?.[activeTab]?.approvedToday ?? 0))} from yesterday
            </p>
          </div>
          <div className="bg-white dark:bg-dark-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
            <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Rejected Today</h3>
            <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {stats?.[activeTab].rejectedToday || 0}
            </p>
            <p className="text-small-regular text-dark-2">Incomplete documents</p>
          </div>
          <div className="bg-white dark:bg-dark-bg p-4 rounded-lg border border-sidebar-border dark:border-dark-border">
            <h3 className="text-small-medium text-dark-2 dark:text-dark-text">Average Response Time</h3>
            <p className="text-heading3-bold text-main-heading dark:text-dark-text">
            {stats?.[activeTab].responseTime || 0}h
            </p>
            <p className="text-small-regular text-success-text">Within SLA</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KYC List */}
          <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
            <div className="p-4 border-b border-sidebar-border dark:border-dark-border">
                <h2 className="text-heading3-bold text-main-heading dark:text-dark-text">
                  {activeTab === 'vendor' ? 'Vendor' : 'Client'} Verifications
                </h2>
          </div>

          {loading ? (
            <div className="p-8">
              <Loader size="lg" text="Loading verifications..." />
              </div>
          ) : kycs.length === 0 ? (
            <div className="p-8 text-center text-dark-2 dark:text-dark-text/60">
              No verifications found
            </div>
          ) : (
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {kycs.map((kyc) => (
                <div
                  key={kyc._id}
                  onClick={() => setSelectedKYC(kyc)}
                  className={`p-4 border border-sidebar-border dark:border-dark-border rounded-lg cursor-pointer transition-colors
                    ${selectedKYC?._id === kyc._id ? 'bg-primary-100 dark:bg-dark-input-bg' : 'hover:bg-white-2 dark:hover:bg-dark-input-bg'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base-semibold text-paragraph dark:text-dark-text">
                        {kyc.customerId.firstName} {kyc.customerId.lastName}
                      </h3>
                      <p className="text-small-regular text-dark-2">{kyc.customerId.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-small-medium rounded-full 
                      ${kyc.status === 'pending' ? 'bg-primary-100 text-primary' :
                        kyc.status === 'approved' ? 'bg-success-bg text-success-text' :
                        kyc.status === 'rejected' ? 'bg-error-bg text-error-text' :
                        'bg-gray-100 text-gray-600'}`}
                    >
                      {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-small-regular text-dark-2">
                      Submitted {new Date(kyc.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-small-regular text-dark-2">•</span>
                    <span className="text-small-regular text-dark-2">
                      {kyc.documents.length} documents
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && kycs.length > 0 && (
            <div className="p-4 border-t border-sidebar-border dark:border-dark-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={10}
                totalItems={totalItems}
              />
            </div>
          )}
          </div>

          {/* Document Viewer */}
          <div className="bg-white dark:bg-dark-bg rounded-lg border border-sidebar-border dark:border-dark-border">
          {selectedKYC ? (
              <>
                <div className="p-4 border-b border-sidebar-border dark:border-dark-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-heading3-bold text-main-heading dark:text-dark-text">
                      {selectedKYC.customerId.firstName} {selectedKYC.customerId.lastName}
                      </h2>
                      <p className="text-small-regular text-dark-2">
                      {selectedKYC.customerId.userType.charAt(0).toUpperCase() + 
                      selectedKYC.customerId.userType.slice(1)} Verification
                      </p>
                    </div>
                  {selectedKYC.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleVerificationAction(selectedKYC._id, 'reject')}
                        disabled={processingAction || !reviewNotes.trim()}
                        className="bg-error-bg text-error-text hover:bg-error-btn hover:text-white"
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleVerificationAction(selectedKYC._id, 'approve')}
                        disabled={processingAction}
                        className="bg-success-bg text-success-text hover:bg-success-btn hover:text-white"
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
                </div>

                <div className="p-4">
                <h3 className="text-base-medium text-paragraph dark:text-dark-text mb-4">
                  Submitted Documents
                </h3>
                  <div className="space-y-4">
                  {selectedKYC.documents.map((doc) => (
                      <div
                      key={doc.fileUrl}
                        className="p-4 border border-sidebar-border dark:border-dark-border rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                          <p className="text-base-medium text-paragraph dark:text-dark-text break-words break-all">
                            {doc.fileName}
                          </p>
                            <p className="text-small-regular text-dark-2">
                            {doc.documentType.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                            </p>
                          </div>
                          <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingDocument(doc);
                          }}
                          className="text-primary hover:text-primary-500"
                          >
                            View Document
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                {selectedKYC.status === 'pending' && (
                  <div className="mt-6">
                    <h3 className="text-base-medium text-paragraph dark:text-dark-text mb-4">
                      Review Notes
                    </h3>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full h-32 px-4 py-2 bg-white-2 dark:bg-dark-input-bg border border-sidebar-border dark:border-dark-border rounded-lg text-paragraph dark:text-dark-text focus:outline-none focus:border-primary resize-none"
                      placeholder="Add notes about this verification..."
                    />
                  </div>
                )}

                {selectedKYC.status !== 'pending' && (
                  <div className="mt-6 p-4 bg-white-2 dark:bg-dark-input-bg rounded-lg">
                    <h3 className="text-base-medium text-paragraph dark:text-dark-text mb-2">
                      Verification Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-small-regular text-dark-2">
                        Status: <span className="text-paragraph dark:text-dark-text">
                          {selectedKYC.status.charAt(0).toUpperCase() + selectedKYC.status.slice(1)}
                        </span>
                      </p>
                      {selectedKYC.verifiedAt && (
                        <p className="text-small-regular text-dark-2">
                          Verified on: <span className="text-paragraph dark:text-dark-text">
                            {new Date(selectedKYC.verifiedAt).toLocaleString()}
                          </span>
                        </p>
                      )}
                      {selectedKYC.verifiedBy && (
                        <p className="text-small-regular text-dark-2">
                          Verified by: <span className="text-paragraph dark:text-dark-text">
                            {selectedKYC.verifiedBy.firstName} {selectedKYC.verifiedBy.lastName}
                          </span>
                        </p>
                      )}
                      {selectedKYC.rejectionReason && (
                        <p className="text-small-regular text-dark-2">
                          Rejection Reason: <span className="text-error-text">
                            {selectedKYC.rejectionReason}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-white-2 dark:bg-dark-input-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
              <h3 className="text-base-medium text-paragraph dark:text-dark-text">
                No Verification Selected
              </h3>
              <p className="text-small-regular text-dark-2">
                Select a verification from the list to view details
              </p>
              </div>
            )}
        </div>
      </div>

      {viewingDocument && (
        <DocumentViewerModal
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          document={viewingDocument}
        />
      )}
    </div>
  );
} 