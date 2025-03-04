"use client";

import ProjectTable from "../../../components/dashboard/PaymentHistory";
import Topbar from "../../../components/dashboard/Topbar";
import Overview from "../../../components/dashboard/Overview";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/helpers/fromatDate";
import { useUser } from "@/contexts/UserContext";
import { useSearchParams } from "next/navigation";

export default function DisputeManagementScreen() {
  const {user} = useUser();
  const [activeTab, setActiveTab] = useState<any>("disputed");
  const [contractData, setContractData] = useState<any>(null);
  const searchParams = useSearchParams();
  const paramContractId = searchParams.get("contractId")?.replace("==", ""); // Remove the double equals if present

  return (
    <>
      <Topbar
        title="Dispute Management Screen"
        description="Here is a Detailed information about your disputes raised related to your work"
      />
      <div className="md:px-10 md:mt-[85px] mt-[95px]">
        <Overview
          dispute={true}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onDataFetched={setContractData}
        />
        <ProjectTable
          showFilter={true} 
          transactions={contractData?.payments?.map((payment: any) => ({
            id: payment._id,
            contractId: payment.contractId.contractId,
            milestoneName: payment.contractTitle,
            date: formatDate(payment.createdAt, false),
            vendorName: user?.userType === 'vendor' ? payment.payerId.userName : payment.payeeId.userName,
            status: payment.status.toLowerCase(),
            amount: `$${payment.totalAmount?.toFixed(2)}`,
          })) || []}
          dispute={true}
          showOnlyOne={true}
          paramContractId={paramContractId}
        />
      </div>
    </>
  );
}