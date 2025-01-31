"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";
import { io } from "socket.io-client";
import Topbar from "./dashboard/Topbar";

// WebSocket & API URLs
const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  content: string;
  type: "text" | "image" | "document";
  readBy: string[] | undefined;
  isRead: boolean;
  createdAt: string;
}

const Chat = ({ disputeId, userId }: { disputeId: string; userId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    socket.current = io(SOCKET_SERVER_URL, {
      path: "/socket.io",
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    // Fetch chat history
    fetchMessages();

    // Listen for new messages
    socket.current.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [disputeId, isMounted]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/${disputeId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      markMessagesAsRead();
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isMounted]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender: userId,
      content: newMessage,
      type: "text",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${disputeId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      const savedMessage = await res.json();
      socket.current.emit("newMessage", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/${disputeId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      });

      setMessages((prevMessages) =>
        prevMessages.map((msg) => ({
          ...msg,
          readBy: [...new Set([...(Array.isArray(msg.readBy) ? msg.readBy : []), userId])],
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  if (!isMounted) {
    return <div className="text-center py-10">Loading chat...</div>;
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  }

  return (
    <>
      <Topbar title="Dispute Chat" description={`ID: ${disputeId}`} />
      <div className="flex flex-col h-[calc(90vh-80px)] mt-[60px]">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-6 lg:px-8 mt-4">
          <div className="max-w-6xl mx-auto space-y-6 mb-12">
            {loading ? (
              <div className="text-center text-gray-500 py-10">
                Loading messages...
              </div>
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender?._id === userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 md:max-w-[70%] ${
                      message.sender?._id === userId
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white">
                          {message.sender?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`flex flex-col ${
                          message.sender?._id === userId
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 md:gap-4 mb-1">
                          <span className="text-[#8A8F9B] text-[10px] md:text-[12px]">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                          <span className="text-paragraph text-base-medium">
                            {message.sender?.name || "Unknown"}
                          </span>
                        </div>
                        <div
                          className={`p-3 md:p-4 ${
                            message.sender?._id === userId
                              ? "bg-primary text-white rounded-b-[14px] rounded-tl-[14px]"
                              : "bg-white border border-[#E7E7E7] text-paragraph rounded-b-[14px] rounded-tr-[14px]"
                          }`}
                        >
                          <p className="text-[14px]">{message.content}</p>
                        </div>
                        {message.sender?._id === userId && (
                          <span className="text-xs text-gray-500">
                            {message.isRead ? "Seen" : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                No messages yet
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-[#E8EAEE] bg-white px-2 md:px-4 py-3 md:py-4 absolute bottom-0 right-0 left-0 w-full">
          <div className="max-w-7xl mx-auto flex gap-2 md:gap-4 justify-between items-center">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-2 md:p-4 text-paragraph text-[16px] md:text-[20px] focus:outline-none"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary-500 text-white flex items-center gap-2"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
