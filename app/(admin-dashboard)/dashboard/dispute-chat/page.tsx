"use client"
import React from 'react'
import DisputeChat from '@/components/dashboard/DisputeChat'
import { useAdmin } from '@/components/providers/AdminProvider';

const AdminDisputeChatPage = () => {
  const { user, loading: userLoading } = useAdmin();
  console.log(user, "useruseruser");
  
  return (
    <DisputeChat user={user} userLoading={userLoading} isAdmin={true} />
  )
}

export default AdminDisputeChatPage;