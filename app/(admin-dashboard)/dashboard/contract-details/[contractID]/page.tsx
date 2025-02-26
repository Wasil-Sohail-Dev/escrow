"use client";
import ContactDetails from '@/components/dashboard/ContractDetails';
import { useParams } from 'next/navigation';
import React from 'react'

const ContractDetailsPage = () => {
  const { contractID } = useParams<{ contractID: string }>();
  return (
    <ContactDetails isAdmin={true} contractID={contractID} />
  )
}

export default ContractDetailsPage;
