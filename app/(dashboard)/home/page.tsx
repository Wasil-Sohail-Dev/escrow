"use client";

import ProjectTable from "../components/PaymentHistory";
import PaymentOverview from "../components/PaymentOverview";
import Topbar from "../components/Topbar";
import { transactions } from "@/lib/data/transactions";
import Overview from "../components/Overview";
import NewMilestoneModal from "@/components/modals/NewMilestoneModal";
import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
    <>
    <NewMilestoneModal 
      isOpen={isOpen}
      onClose={handleClose}
      onAccept={() => {}}
      onDecline={() => {}}
    />
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
