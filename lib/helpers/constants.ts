export interface PaymentData {
  _id: string;
  contractId: string;
  contractTitle?: string;
  payerId: {
    _id: string;
    email: string;
    userName: string;
  };
  payeeId: {
    _id: string;
    email: string;
    userName: string;
  };
  totalAmount: number;
  platformFee: number;
  escrowAmount: number;
  stripePaymentIntentId: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export const FILTER_OPTION = {
  dateRange: [
    "Last 7 days",
    "Last 30 days",
    "Last 3 months",
    "Last 6 months",
    "Last year",
  ],
  status: [
    "All",
    "On Hold",
    "Process",
    "Released",
    "Failed",
    "Refunded",
    "Disputed",
    // "Funded",
    // "Pending", 
    // "Cancelled"
  ]
};

export const FILTER_OPTIONS = {
  dateRange: ["Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months", "Last Year"],
  status: [
    { label: "All", color: "#000000" },
    { label: "On Hold", color: "#EB2E2E" },
    { label: "Process", color: "#F29A2E" },
    { label: "Released", color: "#68E05E" },
    { label: "Failed", color: "#EB2E2E" },
    { label: "Refunded", color: "#F29A2E" },
    { label: "Disputed", color: "#EB2E2E" }
  ],
  paymentMethod: ["All", "Stripe", "Bank Transfer"],
  project: ["All Projects"]
}; 


