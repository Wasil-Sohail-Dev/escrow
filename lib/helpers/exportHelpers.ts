import * as XLSX from 'xlsx';

interface PaymentData {
  _id: string;
  contractId: string;
  payerId: {
    _id: string;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
    userName: string;
  };
  payeeId: {
    _id: string;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
    userName: string;
  };
  totalAmount: number;
  platformFee: number;
  escrowAmount: number;
  stripePaymentIntentId: string;
  onHoldAmount: number;
  releasedAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface DisputeData {
  _id: string;
  contractId: string;
  title: string;
  description: string;
  clientId: string;
  vendorId: string;
  budget: number;
  status: string;
  createdAt: string;
  milestones: Array<{
    title: string;
    amount: number;
    description: string;
    status: string;
    _id: string;
    milestoneId: string;
  }>;
}

const formatPaymentDataForExport = (payment: PaymentData) => ({
  'Payment ID': payment.stripePaymentIntentId,
  'Date': new Date(payment.createdAt).toLocaleDateString(),
  'Status': payment.status.replace(/_/g, ' ').toUpperCase(),
  'Payment Method': payment.paymentMethod.toUpperCase(),
  'Total Amount': `$${payment.totalAmount.toFixed(2)}`,
  'Platform Fee': `$${payment.platformFee.toFixed(2)}`,
  'Escrow Amount': `$${payment.escrowAmount.toFixed(2)}`,
  'On Hold Amount': `$${payment.onHoldAmount.toFixed(2)}`,
  'Released Amount': `$${payment.releasedAmount.toFixed(2)}`,
  'Payer Name': `${payment.payerId.firstName} ${payment.payerId.lastName}`,
  'Payer Email': payment.payerId.email,
  'Payee Name': `${payment.payeeId.firstName} ${payment.payeeId.lastName}`,
  'Payee Email': payment.payeeId.email,
});

const formatDisputeDataForExport = (dispute: DisputeData) => ({
  'Project Name': dispute.title,
  'Dispute ID': dispute.contractId,
  'Date Created': new Date(dispute.createdAt).toLocaleDateString(),
  'Status': dispute.status.replace(/_/g, ' ').toUpperCase(),
  'Budget': `$${dispute.budget.toFixed(2)}`,
});

export const exportPaymentHistoryToTxt = (payments: PaymentData[]) => {
  if (!payments || payments.length === 0) return;

  let txtContent = 'Payment History Report\n';
  txtContent += '======================\n\n';

  payments.forEach((payment, index) => {
    const formattedData = formatPaymentDataForExport(payment);
    txtContent += `Payment #${index + 1}\n`;
    txtContent += '-----------------\n';
    Object.entries(formattedData).forEach(([key, value]) => {
      txtContent += `${key}: ${value}\n`;
    });
    txtContent += '\n';
  });

  // Add summary
  txtContent += '\nSummary\n';
  txtContent += '=======\n';
  txtContent += `Total Payments: ${payments.length}\n`;
  txtContent += `Total Amount: $${payments.reduce((sum, payment) => sum + payment.totalAmount, 0).toFixed(2)}\n`;
  txtContent += `Generated on: ${new Date().toLocaleString()}\n`;

  // Create blob and download
  const blob = new Blob([txtContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payment_history_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportPaymentHistoryToExcel = (payments: PaymentData[]) => {
  if (!payments || payments.length === 0) return;

  // Transform the data for export
  const exportData = payments.map(formatPaymentDataForExport);

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 30 }, // Payment ID
    { wch: 15 }, // Date
    { wch: 20 }, // Status
    { wch: 15 }, // Payment Method
    { wch: 15 }, // Total Amount
    { wch: 15 }, // Platform Fee
    { wch: 15 }, // Escrow Amount
    { wch: 15 }, // On Hold Amount
    { wch: 15 }, // Released Amount
    { wch: 25 }, // Payer Name
    { wch: 30 }, // Payer Email
    { wch: 25 }, // Payee Name
    { wch: 30 }, // Payee Email
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payment History');

  // Generate file name with current date
  const fileName = `payment_history_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Save file
  XLSX.writeFile(wb, fileName);
};

export const exportDisputeHistoryToTxt = (disputes: DisputeData[]) => {
  if (!disputes || disputes.length === 0) return;

  let txtContent = 'Dispute History Report\n';
  txtContent += '=====================\n\n';

  disputes.forEach((dispute, index) => {
    const formattedData = formatDisputeDataForExport(dispute);
    txtContent += `Dispute #${index + 1}\n`;
    txtContent += '-----------------\n';
    Object.entries(formattedData).forEach(([key, value]) => {
      txtContent += `${key}: ${value}\n`;
    });
    txtContent += '\n';
  });

  // Add summary
  txtContent += '\nSummary\n';
  txtContent += '=======\n';
  txtContent += `Total Disputes: ${disputes.length}\n`;
  txtContent += `Total Budget: $${disputes.reduce((sum, dispute) => sum + dispute.budget, 0).toFixed(2)}\n`;
  txtContent += `Generated on: ${new Date().toLocaleString()}\n`;

  // Create blob and download
  const blob = new Blob([txtContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dispute_history_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportDisputeHistoryToExcel = (disputes: DisputeData[]) => {
  if (!disputes || disputes.length === 0) return;

  // Transform the data for export
  const exportData = disputes.map(formatDisputeDataForExport);

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 40 }, // Project Name
    { wch: 15 }, // Dispute ID
    { wch: 15 }, // Date Created
    { wch: 15 }, // Status
    { wch: 15 }, // Budget
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dispute History');

  // Generate file name with current date
  const fileName = `dispute_history_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Save file
  XLSX.writeFile(wb, fileName);
}; 