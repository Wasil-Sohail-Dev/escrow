"use client";

import ProjectTable from "../../../components/dashboard/PaymentHistory";
import PaymentOverview from "../../../components/dashboard/PaymentOverview";
import Topbar from "../../../components/dashboard/Topbar";
import Overview, { TabOption } from "../../../components/dashboard/Overview";
import { use, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/helpers/fromatDate";
import MakeAccount from "@/components/dashboard/MakeAccount";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabOption>("active");
  const [contractData, setContractData] = useState<any>(null);
  const { user } = useUser();

  const transformPayments = (payments: any[] | undefined) => {
    if (!payments || payments.length === 0) return [];

    return payments.map((payment: any) => ({
      id: payment._id,
      milestoneName: payment.contractTitle,
      date: formatDate(payment.createdAt, false),
      vendorName:
        user?.userType === "vendor"
          ? payment.payerId.userName
          : payment.payeeId.userName,
      status: payment.status.toLowerCase(),
      amount: `$${payment.totalAmount?.toFixed(2)}`,
    }));
  };

  return (
    <>
      <Topbar
        title="Overview"
        description="Detailed information about your work"
      />
      <div className="md:px-10 mt-[85px]">
        {user?.userType === "vendor" &&
          user?.verificationStatus !== "verified" && <MakeAccount />}
        <Overview
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onDataFetched={setContractData}
        />
        <PaymentOverview show={true} payments={contractData?.payments || []} />
        <ProjectTable
          showFilter={true}
          transactions={
            contractData?.payments
              ? transformPayments(contractData?.payments)
              : []
          }
          showOnlyOne={true}
        />
      </div>
    </>
  );
}
