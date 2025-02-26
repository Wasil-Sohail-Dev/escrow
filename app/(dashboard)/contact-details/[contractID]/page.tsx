"use client";
import ContactDetails from "@/components/dashboard/ContractDetails";
import { useParams } from "next/navigation";
import React from "react";

const ContactDetailsPage = () => {
  const { contractID } = useParams<{ contractID: string }>();
  return <ContactDetails isAdmin={false} contractID={contractID} />;
};

export default ContactDetailsPage;
