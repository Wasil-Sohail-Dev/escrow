import { toast } from "@/hooks/use-toast";
import { formatDate } from "./fromatDate";

export   const handleDownloadStatement = (stats:any,payments:any,upcomingPayments:any) => {
    try {
      let statementContent = "PAYMENT STATEMENT\n";
      statementContent += "=================\n\n";
      
      // Add Stats Summary
      statementContent += "SUMMARY\n";
      statementContent += "-------\n";
      if (stats) {
        statementContent += `Total Earnings: $${stats.totalEarnings.amount.toLocaleString()}\n`;
        statementContent += `Growth: ${stats.totalEarnings.growth}% from last month\n`;
        statementContent += `Pending Payments: $${stats.pending.amount.toLocaleString()} (${stats.pending.count} payments)\n`;
        statementContent += `In Escrow: $${stats.inEscrow.amount.toLocaleString()} (${stats.inEscrow.count} milestones)\n`;
        statementContent += `Released This Month: $${stats.released.amount.toLocaleString()}\n`;
      }
      statementContent += "\n";

      // Add Payment Details
      statementContent += "PAYMENT DETAILS\n";
      statementContent += "--------------\n";
      payments.forEach((payment:any) => {
        statementContent += `\nTransaction ID: #${payment.stripePaymentIntentId.slice(-8)}\n`;
        statementContent += `Project: ${payment.contractId.title}\n`;
        statementContent += `Client: ${payment.payerId.firstName} ${payment.payerId.lastName}\n`;
        statementContent += `Amount: $${payment.totalAmount.toLocaleString()}\n`;
        statementContent += `Status: ${payment.status.replace(/_/g, " ").replace(/\b\w/g, (l:any) => l.toUpperCase())}\n`;
        statementContent += `Date: ${formatDate(payment.createdAt)}\n`;
        statementContent += "----------------------------------------\n";
      });

      // Add Upcoming Payments
      if (upcomingPayments.length > 0) {
        statementContent += "\nUPCOMING PAYMENTS\n";
        statementContent += "----------------\n";
        upcomingPayments.forEach((payment:any) => {
          statementContent += `\nProject: ${payment.title}\n`;
          statementContent += `Milestone: ${payment.milestone.title}\n`;
          statementContent += `Amount: $${payment.milestone.amount.toLocaleString()}\n`;
          statementContent += `Due in: ${payment.daysUntilDue} days\n`;
          statementContent += "----------------------------------------\n";
        });
      }

      // Create and download the file
      const blob = new Blob([statementContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment_statement_${formatDate(new Date().toISOString())}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Payment statement downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading statement:", error);
      toast({
        title: "Error",
        description: "Failed to download payment statement",
        variant: "destructive",
      });
    }
  };