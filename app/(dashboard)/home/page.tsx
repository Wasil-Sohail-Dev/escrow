"use client";

import ProjectTable from "../components/PaymentHistory";
import PaymentOverview from "../components/PaymentOverview";
import Topbar from "../components/Topbar";
import { transactions } from "@/lib/data/transactions";
import Overview from "../components/Overview";

export default function Home() {
  return (
    <>
      <Topbar
        title="Overview"
        description="Detailed information about your work"
      />
      <div className="px-10 mt-[85px]">
        <Overview />

        <PaymentOverview show={true} />
        <ProjectTable showFilter={true} transactions={[transactions[0]]} />
      </div>
    </>
  );
}
