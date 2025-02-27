"use client"
import React from 'react'
import DisputeChat from '@/components/dashboard/DisputeChat'
import { useUser } from '@/contexts/UserContext';
const DisputeChatPage = () => {
  const { user, loading: userLoading } = useUser();
  return (
    <DisputeChat user={user} userLoading={userLoading} isAdmin={false} />
  )
}

export default DisputeChatPage;