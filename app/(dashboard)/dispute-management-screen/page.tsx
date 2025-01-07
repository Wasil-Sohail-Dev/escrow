"use client";

import ProjectTable from "../components/PaymentHistory";
import Topbar from "../components/Topbar";
import Overview from "../components/Overview";

const disputeData = [
  {
    id: "#DSP 11232",
    milestoneName: "House Renovation",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "cancelled" as const,
    amount: "Default Job",
  },
  {
    id: "#DSP 11241",
    milestoneName: "Floor Planning",
    date: "Aug 29,2023",
    vendorName: "Stefan",
    status: "pending" as const,
    amount: "Default Job",
  },
  {
    id: "#DSP 11245",
    milestoneName: "Wall Painting",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "delivered" as const,
    amount: "Default Job",
  },
];

export default function DisputeManagementScreen() {
  return (
    <>
      <Topbar
        title="Dispute Management screen"
        description="Here is a Detailed information about your disputes raised related to your work"
      />
      <div className="px-10 mt-[85px]">
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
