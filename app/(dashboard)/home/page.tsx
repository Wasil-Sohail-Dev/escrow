"use client";

import ProjectTable from "../../../components/dashboard/PaymentHistory";
import PaymentOverview from "../../../components/dashboard/PaymentOverview";
import Topbar from "../../../components/dashboard/Topbar";
import Overview, { TabOption } from "../../../components/dashboard/Overview";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/helpers/fromatDate";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabOption>("active");
  const [contractData, setContractData] = useState<any>(null);
  const { user } = useUser();
  console.log(contractData, "contractData");
  
  return (
    <>
    {/* <NewMilestoneModal 
      isOpen={isOpen}
      onClose={handleClose}
      onAccept={() => {}}
      onDecline={() => {}}
    /> */}
      <Topbar
        title="Overview"
        description="Detailed information about your work"
      />
      <div className="md:px-10 mt-[85px]">
        <Overview 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onDataFetched={setContractData}
        />
        <PaymentOverview 
          show={true} 
          payments={contractData?.payments} 
        />
        <ProjectTable 
          showFilter={true} 
          transactions={contractData?.payments?.map((payment: any) => ({
            id: payment._id,
            milestoneName: payment.contractTitle,
            date: formatDate(payment.createdAt, false),
            vendorName: user?.userType === 'vendor' ? payment.payerId.userName : payment.payeeId.userName,
            status: payment.status.toLowerCase(),
            amount: `$${payment.amount.toFixed(2)}`,
          })) || []}
        />
      </div>
    </>
  );
}
