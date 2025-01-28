"use client";

import ProjectTable from "../../../components/dashboard/PaymentHistory";
import Topbar from "../../../components/dashboard/Topbar";
import Overview, { TabOption } from "../../../components/dashboard/Overview";
import { disputeData } from "@/lib/data/transactions";
import { useState } from "react";

export default function DisputeManagementScreen() {
  const [activeTab, setActiveTab] = useState<any>("disputes");
  const [contractData, setContractData] = useState<any>(null);
  return (
    <>
      <Topbar
        title="Dispute Management screen"
        description="Here is a Detailed information about your disputes raised related to your work"
      />
      <div className="md:px-10 md:mt-[85px] mt-[95px]">
        <Overview
          dispute={true}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <ProjectTable
          showFilter={true}
          transactions={disputeData}
          dispute={true}
        />
      </div>
    </>
  );
}
