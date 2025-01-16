"use client"; // Required in app directory for hooks like useParams

import { useParams } from "next/navigation";

const Page = () => {
  const { contractId } = useParams();

  return (
    <div>
      <h1>View Contract: {contractId}</h1>
    </div>
  );
};

export default Page;
