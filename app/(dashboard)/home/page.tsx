"use client";

import ProjectTable from "../../../components/dashboard/PaymentHistory";
import PaymentOverview from "../../../components/dashboard/PaymentOverview";
import Topbar from "../../../components/dashboard/Topbar";
import { transactions } from "@/lib/data/transactions";
import Overview from "../../../components/dashboard/Overview";

export default function Home() {

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
        <Overview />
        <PaymentOverview show={true} />
        <ProjectTable showFilter={true} transactions={[transactions[0]]} />
      </div>
    </>
  );
}
