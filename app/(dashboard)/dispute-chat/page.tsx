"use client"

import React, { useState, useRef, useEffect } from "react"
import Topbar from "@/components/dashboard/Topbar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import Loader from "@/components/ui/loader"

interface Sender {
  _id: string
  email: string
  userName: string
}

interface Message {
  _id: string
  sender: Sender
  content: string
  type: string
  isRead: boolean
  createdAt: string
}

interface Participant {
  _id: string
  email: string
}

interface ChatData {
  _id: string
  disputeId: string
  participants: Participant[]
  messages: Message[]
  lastMessage: string
  lastMessageAt: string
}

interface ContractInfo {
  _id: string;
  contractId: string;
  title: string;
}

interface UserInfo {
  _id: string;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  userName: string;
}

interface Dispute {
  _id: string;
  contractId: ContractInfo;
  milestoneId: string;
  raisedBy: UserInfo;
  raisedTo: UserInfo;
  title: string;
  reason: string;
  status: string;
  disputeId: string;
  createdAt: string;
  updatedAt: string;
  chat: {
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
  };
}

interface DisputeResponse {
  success: boolean;
  data: {
    totalDisputes: number;
    disputes: Dispute[];
    latestDispute: Dispute;
  };
}

interface UnreadCount {
  [key: string]: number;
}

const DisputeChat = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const disputeId = searchParams.get("disputeId")
  const { user, loading: userLoading } = useUser()
  const userId = user?._id

  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedDisputeTitle, setSelectedDisputeTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<UnreadCount>({})
  const [disputesLoading, setDisputesLoading] = useState(true)

  const fetchChat = async () => {
    if (!userId) return;
    
    try {
      setLoading(true)
      const response = await fetch(`/api/chat/${disputeId}`)
      const data: ChatData = await response.json()
      setChatData(data)
      const sortedMessages = [...(data.messages || [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      setMessages(sortedMessages)
      markMessagesAsRead()
    } catch (error) {
      console.error("Error fetching chat:", error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const markMessagesAsRead = async () => {
    if (!userId || !selectedDispute) return
    try {
      await fetch(`/api/chat/${disputeId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      })
      
      // Update local state to remove unread count
      setDisputes(prevDisputes => 
        prevDisputes.map(dispute => 
          dispute._id === selectedDispute._id 
            ? { ...dispute, chat: { ...dispute.chat, unreadCount: 0 } }
            : dispute
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return

    try {
      const response = await fetch(`/api/chat/${disputeId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: userId,
          content: newMessage,
          type: "text",
        }),
      })

      const savedMessage = await response.json()
      
      const newMessageObj: Message = {
        _id: savedMessage._id,
        content: savedMessage.content,
        type: savedMessage.type,
        isRead: savedMessage.isRead,
        createdAt: savedMessage.createdAt,
        sender: {
          _id: user!._id,
          email: user!.email,
          userName: user!.userName
        }
      }
      
      setMessages(prev => [...prev, newMessageObj])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Add function to fetch unread counts
  const fetchUnreadCounts = async (disputes: Dispute[]) => {
    const counts: UnreadCount = {};
    
    for (const dispute of disputes) {
      try {
        const response = await fetch(`/api/chat/${dispute._id}`);
        const chatData: ChatData = await response.json();
        
        // Count unread messages
        const unreadCount = chatData.messages.filter(
          msg => !msg.isRead && msg.sender._id !== userId
        ).length;
        
        counts[dispute._id] = unreadCount;
      } catch (error) {
        console.error(`Error fetching chat for dispute ${dispute._id}:`, error);
      }
    }
    
    setUnreadCounts(counts);
  };

  const fetchDisputes = async () => {
    if (!user?._id) return;
    
    try {
      setDisputesLoading(true)
      const response = await fetch(`/api/get-dispute?customerId=${user._id}&userType=${user.userType}`);
      const data: DisputeResponse = await response.json();
      
      if (data.success) {
        setDisputes(data.data.disputes);
        fetchUnreadCounts(data.data.disputes);
        
        if (!selectedDispute && data.data.latestDispute) {
          setSelectedDisputeTitle(data.data.latestDispute.title);
        }
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setDisputesLoading(false)
    }
  };

  const handleDisputeClick = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setSelectedDisputeTitle(dispute.title);
    setShowMobileChat(true);
    setLoading(true);
    router.push(`?disputeId=${dispute._id}`);
  };

  const handleBackToDisputes = () => {
    setShowMobileChat(false);
    router.push('?');
  };

  useEffect(() => {
    if (userId && disputeId) {
      fetchChat()
    }
  }, [userId, disputeId])

  useEffect(() => {
    if (user?._id) {
      fetchDisputes();
    }
  }, [user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage()
    }
  }

  // Show loading state while user data is being fetched
  if (userLoading) {
    return <div className="flex justify-center items-center h-screen">
      <Loader size="lg" text="Loading user data..." fullHeight={true} />
    </div>
  }

  // Show message if no user is found
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in to view chat</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Dispute Chat" description="Select a dispute to start chatting" />

      <div className="flex flex-1 overflow-hidden mt-[100px]">
        {/* Disputes Sidebar */}
        <div className={`md:w-80 w-full border-r border-[#DFDFDF] dark:border-dark-border bg-white dark:bg-dark-bg flex flex-col h-full ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-[31px] border-b border-[#DFDFDF] dark:border-dark-border">
            <h2 className="text-lg font-medium text-paragraph dark:text-dark-text">Disputes</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {disputesLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader size="md" text="Loading disputes..." fullHeight={false} />
              </div>
            ) : disputes.length > 0 ? (
              disputes.map((dispute) => (
                <div
                  key={dispute._id}
                  onClick={() => handleDisputeClick(dispute)}
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-input-bg ${
                    disputeId === dispute._id ? "bg-gray-50 dark:bg-dark-input-bg" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white dark:text-dark-text text-[16px] font-medium">
                        {dispute.disputeId.slice(-4)}
                      </span>
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-dark-bg ${
                        dispute.status === "pending" ? "bg-yellow-500" : 
                        dispute.status === "resolved" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium truncate text-paragraph dark:text-dark-text ${dispute.chat?.unreadCount ? 'font-semibold' : ''}`}>
                        {dispute.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-dark-text/60 flex-shrink-0 ml-2">
                        {formatMessageDate(dispute.chat?.lastMessageAt || dispute.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm text-gray-600 dark:text-dark-text/80 truncate">
                          {dispute.contractId.title}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-dark-text/60 truncate">
                          {user?._id === dispute.raisedBy._id ? 
                            `To: ${dispute.raisedTo.userName}` : 
                            `From: ${dispute.raisedBy.userName}`}
                        </p>
                        {dispute.chat?.lastMessage && (
                          <p className="text-sm text-gray-500 dark:text-dark-text/60 truncate">
                            {dispute.chat.lastMessage}
                          </p>
                        )}
                      </div>
                      {dispute.chat?.unreadCount > 0 && (
                        <div className="ml-2 flex-shrink-0">
                          <div className="bg-primary text-white dark:text-dark-text text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                            {dispute.chat.unreadCount}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500 dark:text-dark-text/60">
                <p>No disputes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col h-full ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {(disputeId || showMobileChat) ? (
            <>
              {/* Chat Header */}
              <div className="h-[90px] border-b border-[#DFDFDF] dark:border-dark-border flex items-center px-4 flex-shrink-0 bg-white dark:bg-dark-bg">
                {showMobileChat && (
                  <button 
                    onClick={handleBackToDisputes}
                    className="mr-4 md:hidden text-paragraph dark:text-dark-text"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="flex-shrink-0 relative">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white dark:text-dark-text text-base-medium">D</span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <p className="text-paragraph dark:text-dark-text text-[20px] font-[500] leading-[23.44px]">
                    {selectedDispute?.title || "Dispute Chat"}
                  </p>
                  <span className="text-[14px] font-[400] leading-[16.41px] text-primary">ID: {disputeId}</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 bg-white dark:bg-dark-bg">
                <div className="max-w-6xl mx-auto space-y-6 py-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader size="md" text="Loading messages..." fullHeight={false} />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((message) => (
                      message && message.sender && (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === userId ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-3 md:max-w-[70%] ${
                              message.sender._id === userId ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-white dark:text-dark-text">
                                  {message.sender.userName?.[0] || message.sender.email?.[0] || 'U'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div
                                className={`flex flex-col ${
                                  message.sender._id === userId ? "items-end" : "items-start"
                                }`}
                              >
                                <div className="flex items-center gap-2 md:gap-4 mb-1">
                                  {message.sender._id === userId ? (
                                    <>
                                      <span className="text-[#8A8F9B] dark:text-dark-text/60 text-[10px] md:text-[12px]">
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                      </span>
                                      <span className="text-paragraph dark:text-dark-text text-base-medium">
                                        {message.sender.userName || message.sender.email}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-paragraph dark:text-dark-text text-base-medium">
                                        {message.sender.userName || message.sender.email}
                                      </span>
                                      <span className="text-[#8A8F9B] dark:text-dark-text/60 text-[10px] md:text-[12px]">
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div
                                  className={`p-3 md:p-4 ${
                                    message.sender._id === userId
                                      ? "bg-primary text-white dark:text-dark-text rounded-b-[14px] rounded-tl-[14px]"
                                      : "bg-white dark:bg-dark-input-bg border border-[#E7E7E7] dark:border-dark-border text-paragraph dark:text-dark-text rounded-b-[14px] rounded-tr-[14px]"
                                  }`}
                                >
                                  <p className="text-[14px]">{message.content}</p>
                                </div>
                                {message.sender._id === userId && (
                                  <span className="text-xs text-gray-500 dark:text-dark-text/60 mt-1">
                                    {message.isRead ? "Seen" : "Sent"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-dark-text/60 py-10">
                      No messages yet
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-[#E8EAEE] dark:border-dark-border bg-white dark:bg-dark-bg px-2 md:px-4 py-3 md:py-4">
                <div className="max-w-7xl mx-auto flex gap-2 md:gap-4 justify-between items-center">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full p-2 md:p-4 text-paragraph dark:text-dark-text text-[16px] md:text-[20px] focus:outline-none bg-transparent dark:placeholder:text-dark-text/40"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary-500 text-white dark:text-dark-text flex items-center gap-2"
                  >
                    <Send size={20} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-dark-bg">
              <div className="text-center max-w-[500px] mx-auto px-4">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Send className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-[24px] font-semibold text-paragraph dark:text-dark-text mb-2">
                    No Dispute Selected
                  </h3>
                  <p className="text-[16px] text-gray-500 dark:text-dark-text/60 leading-relaxed">
                    Select a dispute from the sidebar to view the conversation and manage your dispute resolution process.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-lg border border-[#E8EAEE] dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
                    <h4 className="text-[16px] font-medium text-paragraph dark:text-dark-text mb-2">
                      Quick Tips
                    </h4>
                    <ul className="space-y-2 text-[14px] text-gray-500 dark:text-dark-text/60">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>Click on any dispute in the sidebar to view messages</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>All messages are saved and secured</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>You'll be notified of new messages</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DisputeChat
