"use client";

import ProjectTable from "../components/PaymentHistory";
import Topbar from "../components/Topbar";
import Overview from "../components/Overview";
import { disputeData } from "@/lib/data/transactions";

export default function DisputeManagementScreen() {
  return (
    <>
      <Topbar
        title="Dispute Management screen"
        description="Here is a Detailed information about your disputes raised related to your work"
      />
      <div className="md:px-10 md:mt-[85px] mt-[95px]">
        <Overview dispute={true} />

        <ProjectTable
          showFilter={true}
          transactions={disputeData}
          dispute={true}
        />
      </div>
    </>
  );
}
