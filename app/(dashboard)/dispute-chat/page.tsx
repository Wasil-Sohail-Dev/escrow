"use client";

import React, { useState, useRef, useEffect } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Paperclip, X, Eye } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/ui/loader";
import { toast } from "@/hooks/use-toast";
import { handleFileDownload } from "@/lib/helpers/fileHelpers";
import ChatMediaModal from "@/components/modals/ChatMediaModal";
import FileIcon from "@/lib/helpers/fIleIcon";

interface Sender {
  _id: string;
  email: string;
  userName: string;
}

interface FilePreview {
  file: File;
  preview: string;
  type: string;
}

interface Message {
  _id: string;
  sender: Sender;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  files?: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  }[];
}

interface Participant {
  _id: string;
  email: string;
}

interface ChatData {
  _id: string;
  disputeId: string;
  participants: Participant[];
  messages: Message[];
  lastMessage: string;
  lastMessageAt: string;
  hasMore: boolean;
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

const DisputeChat = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const disputeId = searchParams.get("disputeId");
  const { user, loading: userLoading } = useUser();
  const userId = user?._id;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputesLoading, setDisputesLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState<{
    messageId: string;
    type: "images" | "documents";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [sendingMessageId, setSendingMessageId] = useState<string | null>(null);

  const fetchChat = async (
    page = 1,
    append = false,
    disputeId: string | null
  ) => {
    if (!userId) return;
    console.log("ma cla ma cla");

    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetch(`/api/chat/${disputeId}?page=${page}`);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          toast({
            title: "Error",
            description: "Invalid chat ID. Please try again.",
            variant: "destructive",
          });
          router.push("/dispute-chat");
          return;
        }
        throw new Error(errorData.error || "Failed to fetch chat");
      }

      const data = await response.json();

      if (data.messages.length > 0) {
        setLoading(false);
      }

      if (!data.messages) {
        setLoading(false);
        throw new Error("No messages received");
      }

      setHasMore(data.hasMore);
      setCurrentPage(page);

      if (append) {
        setMessages((prev) => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
        requestAnimationFrame(() => {
          const chatContainer = chatContainerRef.current;
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        });
      }

      if (page === 1) {
        markMessagesAsRead();
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load chat messages. Please try again.",
        variant: "destructive",
      });
      if (!append) setMessages([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const chatContainer = e.target as HTMLDivElement;

    if (chatContainer.scrollTop === 0 && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);

      try {
        const response = await fetch(
          `/api/chat/${disputeId}?page=${currentPage + 1}`
        );
        const data = await response.json();

        if (!data.messages) {
          throw new Error("No messages received");
        }

        setHasMore(data.hasMore);
        setCurrentPage((prev) => prev + 1);
        const oldScrollHeight = chatContainer.scrollHeight;
        const oldScrollTop = chatContainer.scrollTop;
        setMessages((prev) => [...data.messages, ...prev]);
        requestAnimationFrame(() => {
          if (chatContainer) {
            const newScrollHeight = chatContainer.scrollHeight;
            chatContainer.scrollTop =
              oldScrollTop + (newScrollHeight - oldScrollHeight);
          }
        });
      } catch (error) {
        console.error("Error loading more messages:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const markMessagesAsRead = async () => {
    if (!userId || !selectedDispute) return;
    try {
      await fetch(`/api/chat/${disputeId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      });

      setDisputes((prevDisputes) =>
        prevDisputes.map((dispute) =>
          dispute._id === selectedDispute._id
            ? { ...dispute, chat: { ...dispute.chat, unreadCount: 0 } }
            : dispute
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: FilePreview[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "file",
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !userId || !user)
      return;

    setIsSending(true);
    const tempMessageId = `temp-${Date.now()}`;
    setSendingMessageId(tempMessageId);

    const optimisticMessage: Message = {
      _id: tempMessageId,
      content: newMessage.trim(),
      type: selectedFiles.length > 0 ? "file" : "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
      },
      files: selectedFiles.map((file) => ({
        fileUrl: file.preview,
        fileName: file.file.name,
        fileType: file.file.type,
      })),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setSelectedFiles([]);

    // Force scroll to bottom when sending a message
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    });

    try {
      const formData = new FormData();
      formData.append("sender", userId);
      formData.append("content", optimisticMessage.content);
      formData.append("type", optimisticMessage.type);

      selectedFiles.forEach((filePreview) => {
        formData.append("files", filePreview.file);
      });

      const response = await fetch(`/api/chat/${disputeId}/message`, {
        method: "POST",
        body: formData,
      });

      const savedMessage = await response.json();

      if (savedMessage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessage._id
              ? {
                  ...savedMessage,
                  sender: {
                    _id: user._id,
                    email: user.email,
                    userName: user.userName,
                  },
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticMessage._id)
      );
    } finally {
      setIsSending(false);
      setSendingMessageId(null);
    }
  };

  const fetchDisputes = async () => {
    if (!user?._id) return;

    try {
      setDisputesLoading(true);
      const response = await fetch(
        `/api/get-dispute?customerId=${user._id}&userType=${user.userType}`
      );
      const data: DisputeResponse = await response.json();

      if (data.success) {
        setDisputes(data.data.disputes);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setDisputesLoading(false);
    }
  };

  const handleDisputeClick = (dispute: Dispute) => {
    if (!dispute._id) {
      toast({
        title: "Error",
        description: "Invalid dispute selected. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Update state first
    setSelectedDispute(dispute);
    setShowMobileChat(true);

    // Use useEffect to handle side effects
    router.push(`?disputeId=${dispute._id}`);
  };

  console.log(selectedDispute, "selectedDispute");

  // Add useEffect to handle chat fetching when dispute changes
  useEffect(() => {
    let disputedId = selectedDispute ? selectedDispute._id : disputeId;
    if (disputedId && user) {
      setCurrentPage(1);
      setHasMore(true);
      fetchChat(1, false, disputedId);
    }
  }, [selectedDispute?._id, disputeId, user]);

  const handleBackToDisputes = () => {
    setShowMobileChat(false);
    router.push("?");
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchDisputes();
    }
  }, [user?._id]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleDownloadFile = async (file: {
    fileUrl: string;
    fileName: string;
    fileType: string;
  }) => {
    try {
      await handleFileDownload(
        {
          name: file.fileName,
          type: file.fileType,
          url: file.fileUrl,
          size: 0,
        },
        toast
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" text="Loading disputes..." fullHeight={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Topbar
        title="Dispute Chat"
        description="Select a dispute to start chatting"
      />

      <div className="flex flex-1 overflow-hidden mt-[100px]">
        {/* Disputes Sidebar */}
        <div
          className={`md:w-80 w-full border-r border-[#DFDFDF] dark:border-dark-border bg-white dark:bg-dark-bg flex flex-col h-full ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-4 py-[31px] border-b border-[#DFDFDF] dark:border-dark-border">
            <h2 className="text-lg font-medium text-paragraph dark:text-dark-text">
              Disputes
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {disputesLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader
                  size="md"
                  text="Loading disputes..."
                  fullHeight={false}
                />
              </div>
            ) : disputes.length > 0 ? (
              disputes.map((dispute) => (
                <div
                  key={dispute._id}
                  onClick={() => handleDisputeClick(dispute)}
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-input-bg ${
                    disputeId === dispute._id
                      ? "bg-gray-50 dark:bg-dark-input-bg"
                      : ""
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
                        dispute.status === "pending"
                          ? "bg-yellow-500"
                          : dispute.status === "resolved"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className={`font-medium truncate text-paragraph dark:text-dark-text ${
                          dispute.chat?.unreadCount ? "font-semibold" : ""
                        }`}
                      >
                        {dispute.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-dark-text/60 flex-shrink-0 ml-2">
                        {formatMessageDate(
                          dispute.chat?.lastMessageAt || dispute.createdAt
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm text-gray-600 dark:text-dark-text/80 truncate">
                          {dispute.contractId.title}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-dark-text/60 truncate">
                          {user?._id === dispute.raisedBy._id
                            ? `To: ${dispute.raisedTo.userName}`
                            : `From: ${dispute.raisedBy.userName}`}
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
        <div
          className={`flex-1 flex flex-col h-full ${
            !showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {disputeId || showMobileChat ? (
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
                    <span className="text-white dark:text-dark-text text-base-medium">
                      D
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <p className="text-paragraph dark:text-dark-text text-[20px] font-[500] leading-[23.44px]">
                    {selectedDispute?.title || "Dispute Chat"}
                  </p>
                  <span className="text-[14px] font-[400] leading-[16.41px] text-primary">
                    ID: {disputeId}
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 bg-white dark:bg-dark-bg chat-container"
                ref={chatContainerRef}
                onScroll={handleScroll}
              >
                <div className="max-w-6xl mx-auto space-y-6 py-4">
                  {isLoadingMore && (
                    <div className="flex justify-center items-center py-4">
                      <Loader
                        size="sm"
                        text="Loading more messages..."
                        fullHeight={false}
                      />
                    </div>
                  )}
                  {loading ? (
                    <div className="flex justify-center items-center h-full min-h-[400px]">
                      <Loader
                        size="md"
                        text="Loading messages..."
                        fullHeight={false}
                      />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map(
                      (message) =>
                        message &&
                        message.sender && (
                          <div
                            key={message._id}
                            className={`flex ${
                              message.sender._id === userId
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex gap-3 md:max-w-[70%] break-words ${
                                message.sender._id === userId
                                  ? "flex-row-reverse"
                                  : "flex-row"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-white dark:text-dark-text">
                                    {message.sender.userName?.[0] ||
                                      message.sender.email?.[0] ||
                                      "U"}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div
                                  className={`flex flex-col ${
                                    message.sender._id === userId
                                      ? "items-end"
                                      : "items-start"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 md:gap-4 mb-1">
                                    {message.sender._id === userId ? (
                                      <>
                                        <span className="text-[#8A8F9B] dark:text-dark-text/60 text-[10px] md:text-[12px]">
                                          {new Date(
                                            message.createdAt
                                          ).toLocaleTimeString()}
                                        </span>
                                        <span className="text-paragraph dark:text-dark-text text-base-medium">
                                          {message.sender.userName ||
                                            message.sender.email}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-paragraph dark:text-dark-text text-base-medium">
                                          {message.sender.userName ||
                                            message.sender.email}
                                        </span>
                                        <span className="text-[#8A8F9B] dark:text-dark-text/60 text-[10px] md:text-[12px]">
                                          {new Date(
                                            message.createdAt
                                          ).toLocaleTimeString()}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div
                                    className={`p-3 md:p-4 break-words whitespace-pre-wrap ${
                                      message.sender._id === userId
                                        ? "bg-primary text-white dark:text-dark-text rounded-b-[14px] rounded-tl-[14px]"
                                        : "bg-white dark:bg-dark-input-bg border border-[#E7E7E7] dark:border-dark-border text-paragraph dark:text-dark-text rounded-b-[14px] rounded-tr-[14px]"
                                    }`}
                                  >
                                    {message.content && (
                                      <p className="text-[14px] mb-2 break-all">
                                        {message.content}
                                      </p>
                                    )}
                                    {message.files &&
                                      message.files.length > 0 && (
                                        <div
                                          className={`${
                                            message.content ? "mt-3" : ""
                                          }`}
                                        >
                                          {/* Images Section */}
                                          {message.files?.filter(
                                            (file) =>
                                              file.fileType.toLowerCase() ===
                                                "jpg" ||
                                              file.fileType.toLowerCase() ===
                                                "jpeg" ||
                                              file.fileType.toLowerCase() ===
                                                "png" ||
                                              file.fileType.toLowerCase() ===
                                                "gif"
                                          ).length > 0 && (
                                            <div
                                              className={`grid gap-3 mb-3 ${
                                                message.files.filter(
                                                  (file) =>
                                                    file.fileType.toLowerCase() ===
                                                      "jpg" ||
                                                    file.fileType.toLowerCase() ===
                                                      "jpeg" ||
                                                    file.fileType.toLowerCase() ===
                                                      "png" ||
                                                    file.fileType.toLowerCase() ===
                                                      "gif"
                                                ).length === 1
                                                  ? "grid-cols-1 max-w-[400px]"
                                                  : "grid-cols-1 sm:grid-cols-2"
                                              }`}
                                            >
                                              {message.files
                                                .filter(
                                                  (file) =>
                                                    file.fileType.toLowerCase() ===
                                                      "jpg" ||
                                                    file.fileType.toLowerCase() ===
                                                      "jpeg" ||
                                                    file.fileType.toLowerCase() ===
                                                      "png" ||
                                                    file.fileType.toLowerCase() ===
                                                      "gif"
                                                )
                                                .slice(0, 4)
                                                .map((file, index) => {
                                                  const isLastImage =
                                                    index === 3;
                                                  const remainingImages =
                                                    (
                                                      message.files || []
                                                    ).filter(
                                                      (file) =>
                                                        file.fileType.toLowerCase() ===
                                                          "jpg" ||
                                                        file.fileType.toLowerCase() ===
                                                          "jpeg" ||
                                                        file.fileType.toLowerCase() ===
                                                          "png" ||
                                                        file.fileType.toLowerCase() ===
                                                          "gif"
                                                    ).length - 4;

                                                  return (
                                                    <div
                                                      key={index}
                                                      className="relative group"
                                                    >
                                                      <div
                                                        className={`rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border ${
                                                          message.files?.filter(
                                                            (file) =>
                                                              file.fileType.toLowerCase() ===
                                                                "jpg" ||
                                                              file.fileType.toLowerCase() ===
                                                                "jpeg" ||
                                                              file.fileType.toLowerCase() ===
                                                                "png" ||
                                                              file.fileType.toLowerCase() ===
                                                                "gif"
                                                          ).length === 1
                                                            ? "h-[300px]"
                                                            : "h-[200px]"
                                                        }`}
                                                      >
                                                        <img
                                                          src={file.fileUrl}
                                                          alt={file.fileName}
                                                          className="w-full h-full object-contain bg-gray-50 dark:bg-dark-input-bg"
                                                        />
                                                        {isLastImage &&
                                                        remainingImages > 0 ? (
                                                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <button
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowAllFiles(
                                                                  {
                                                                    messageId:
                                                                      message._id,
                                                                    type: "images",
                                                                  }
                                                                );
                                                              }}
                                                              className="text-center text-white"
                                                            >
                                                              <p className="text-2xl font-semibold">
                                                                +
                                                                {
                                                                  remainingImages
                                                                }
                                                              </p>
                                                              <p className="text-sm">
                                                                More Images
                                                              </p>
                                                            </button>
                                                          </div>
                                                        ) : (
                                                          !isLastImage && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                                                              <button
                                                                onClick={() =>
                                                                  window.open(
                                                                    file.fileUrl,
                                                                    "_blank"
                                                                  )
                                                                }
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                                                              >
                                                                <Eye className="w-4 h-4" />
                                                                <span>
                                                                  View
                                                                </span>
                                                              </button>
                                                              <button
                                                                onClick={() =>
                                                                  handleDownloadFile(
                                                                    file
                                                                  )
                                                                }
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                                                              >
                                                                <svg
                                                                  className="w-4 h-4"
                                                                  fill="none"
                                                                  viewBox="0 0 24 24"
                                                                  stroke="currentColor"
                                                                >
                                                                  <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                      2
                                                                    }
                                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                                  />
                                                                </svg>
                                                                <span>
                                                                  Download
                                                                </span>
                                                              </button>
                                                            </div>
                                                          )
                                                        )}
                                                      </div>
                                                      <p className="text-xs mt-1 text-gray-500 dark:text-dark-text/60 truncate px-1">
                                                        {file.fileName
                                                          .split("-")
                                                          .pop()}
                                                      </p>
                                                    </div>
                                                  );
                                                })}
                                            </div>
                                          )}

                                          {/* Files Section */}
                                          {message.files?.filter(
                                            (file) =>
                                              ![
                                                "jpg",
                                                "jpeg",
                                                "png",
                                                "gif",
                                              ].includes(
                                                file.fileType.toLowerCase()
                                              )
                                          ).length > 0 && (
                                            <div className="space-y-2">
                                              {message.files
                                                .filter(
                                                  (file) =>
                                                    ![
                                                      "jpg",
                                                      "jpeg",
                                                      "png",
                                                      "gif",
                                                    ].includes(
                                                      file.fileType.toLowerCase()
                                                    )
                                                )
                                                .slice(0, 1)
                                                .map((file, index) => (
                                                  <div
                                                    key={index}
                                                    className="relative group"
                                                  >
                                                    <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg hover:bg-gray-100 dark:hover:bg-dark-2/20 transition-colors">
                                                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                                        <FileIcon
                                                          fileType={
                                                            file.fileType
                                                          }
                                                        />
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
                                                          {file.fileName
                                                            .split("-")
                                                            .pop()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-dark-text/60 mt-1">
                                                          {file.fileType.toUpperCase()}{" "}
                                                          •{" "}
                                                          {formatFileSize(
                                                            file.fileUrl.length
                                                          )}
                                                        </p>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <button
                                                          onClick={() =>
                                                            window.open(
                                                              file.fileUrl,
                                                              "_blank"
                                                            )
                                                          }
                                                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-dark-2/20 hover:bg-gray-300 dark:hover:bg-dark-2/40 transition-colors text-gray-700 dark:text-dark-text"
                                                        >
                                                          <Eye className="w-4 h-4" />
                                                          <span className="hidden sm:inline">
                                                            View
                                                          </span>
                                                        </button>
                                                        <button
                                                          onClick={() =>
                                                            handleDownloadFile(
                                                              file
                                                            )
                                                          }
                                                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-dark-2/20 hover:bg-gray-300 dark:hover:bg-dark-2/40 transition-colors text-gray-700 dark:text-dark-text"
                                                        >
                                                          <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                          >
                                                            <path
                                                              strokeLinecap="round"
                                                              strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                            />
                                                          </svg>
                                                          <span className="hidden sm:inline">
                                                            Download
                                                          </span>
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              {message.files?.filter(
                                                (file) =>
                                                  ![
                                                    "jpg",
                                                    "jpeg",
                                                    "png",
                                                    "gif",
                                                  ].includes(
                                                    file.fileType.toLowerCase()
                                                  )
                                              ).length > 1 && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowAllFiles({
                                                      messageId: message._id,
                                                      type: "documents",
                                                    });
                                                  }}
                                                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg hover:bg-gray-100 dark:hover:bg-dark-2/20 transition-colors"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-2/20 flex items-center justify-center">
                                                      <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                                                        +
                                                        {message.files.filter(
                                                          (file) =>
                                                            ![
                                                              "jpg",
                                                              "jpeg",
                                                              "png",
                                                              "gif",
                                                            ].includes(
                                                              file.fileType.toLowerCase()
                                                            )
                                                        ).length - 1}
                                                      </span>
                                                    </div>
                                                    <span className="text-sm text-gray-700 dark:text-dark-text">
                                                      More Files
                                                    </span>
                                                  </div>
                                                  <Eye className="w-5 h-5 text-gray-500 dark:text-dark-text/60" />
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                  {message.sender._id === userId && (
                                    <span className="text-xs text-gray-500 dark:text-dark-text/60 mt-1">
                                      {message._id === sendingMessageId
                                        ? "Sending..."
                                        : message.isRead
                                        ? "Seen"
                                        : "Sent"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                    )
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
                {selectedFiles.length > 0 && (
                  <div className="max-w-7xl mx-auto mb-3 flex flex-wrap gap-2 p-2 border-b border-[#E8EAEE] dark:border-dark-border">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border w-[100px] h-[100px]"
                      >
                        {file.type === "image" ? (
                          <div className="relative w-full h-full">
                            <img
                              src={file.preview}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-input-bg p-2">
                            <FileIcon fileType={file.file.type} />
                            <span className="text-[10px] text-gray-500 dark:text-dark-text/60 text-center mt-1 line-clamp-1 px-1">
                              {file.file.name.split("-").pop()}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="max-w-7xl mx-auto flex gap-2 md:gap-4 items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.zip"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    <Paperclip size={20} />
                  </Button>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full p-2 md:p-4 text-paragraph dark:text-dark-text text-[16px] md:text-[20px] focus:outline-none bg-transparent dark:placeholder:text-dark-text/40"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      (!newMessage.trim() && selectedFiles.length === 0) ||
                      isSending
                    }
                    className="bg-primary hover:bg-primary-500 text-white dark:text-dark-text flex items-center gap-2"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
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
                    Select a dispute from the sidebar to view the conversation
                    and manage your dispute resolution process.
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
                        <span>
                          Click on any dispute in the sidebar to view messages
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>All messages are saved and secured</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>You&apos;ll be notified of new messages</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAllFiles && (
        <ChatMediaModal
          isOpen={!!showAllFiles}
          onClose={() => setShowAllFiles(null)}
          message={messages.find((m) => m._id === showAllFiles?.messageId)}
          type={showAllFiles?.type}
          onDownload={handleDownloadFile}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  );
};

export default DisputeChat;
