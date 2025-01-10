"use client";

import React, { useState, useRef, useEffect } from "react";
import Topbar from "../components/Topbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Paperclip, Send, Upload } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const DisputeChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Grace Miller", 
      content: "Hi, I need help with my recent order",
      timestamp: "9:15 AM",
      isCurrentUser: true,
    },
    {
      id: 2,
      sender: "Jack Raymonds",
      content: "Hello Grace, I'd be happy to help. Could you please provide more details about the issue you're experiencing?",
      timestamp: "9:17 AM", 
      isCurrentUser: false,
    },
    {
      id: 3,
      sender: "Grace Miller",
      content: "The product I received doesn't match the description on the website",
      timestamp: "9:20 AM",
      isCurrentUser: true,
    },
    {
      id: 4,
      sender: "Jack Raymonds", 
      content: "I apologize for the inconvenience. Could you please share some photos of the product you received?",
      timestamp: "9:22 AM",
      isCurrentUser: false,
    },
    {
      id: 5,
      sender: "Grace Miller",
      content: "Yes, give me a moment to take some pictures",
      timestamp: "9:25 AM",
      isCurrentUser: true,
    },
    {
      id: 6,
      sender: "Grace Miller",
      content: "Here are the photos showing the differences between what was advertised and what I received",
      timestamp: "9:30 AM",
      isCurrentUser: true,
    },
    {
      id: 7,
      sender: "Jack Raymonds",
      content: "Thank you for providing the photos. I can see the discrepancy. Let me check with our product team about this.",
      timestamp: "9:35 AM",
      isCurrentUser: false,
    },
    {
      id: 8,
      sender: "Jack Raymonds",
      content: "I've reviewed the case with our team. We can offer you a full refund or send you a replacement product that matches the original description. Which would you prefer?",
      timestamp: "9:45 AM",
      isCurrentUser: false,
    },
    {
      id: 9,
      sender: "Grace Miller",
      content: "I would prefer a replacement if you can guarantee it will match the original description",
      timestamp: "9:48 AM",
      isCurrentUser: true,
    },
    {
      id: 10,
      sender: "Jack Raymonds",
      content: "Absolutely, I can guarantee that. I'll personally ensure the replacement matches exactly what was advertised.",
      timestamp: "9:50 AM",
      isCurrentUser: false,
    },
    {
      id: 11,
      sender: "Grace Miller",
      content: "Thank you, that would be great",
      timestamp: "9:52 AM",
      isCurrentUser: true,
    },
    {
      id: 12,
      sender: "Jack Raymonds",
      content: "I've processed the replacement order. You'll receive a shipping confirmation email within 24 hours. Is there anything else you need help with?",
      timestamp: "9:55 AM",
      isCurrentUser: false,
    },
    {
      id: 13,
      sender: "Grace Miller",
      content: "What should I do with the incorrect item?",
      timestamp: "9:57 AM",
      isCurrentUser: true,
    },
    {
      id: 14,
      sender: "Jack Raymonds",
      content: "We'll send you a return shipping label by email. Once you receive it, just package the item and use the label to send it back to us.",
      timestamp: "10:00 AM",
      isCurrentUser: false,
    },
    {
      id: 15,
      sender: "Grace Miller",
      content: "Perfect, thanks for your help",
      timestamp: "10:02 AM",
      isCurrentUser: true,
    },
    {
      id: 16,
      sender: "Jack Raymonds",
      content: "You're welcome! The return label has been sent to your email. Let me know if you need anything else.",
      timestamp: "10:05 AM",
      isCurrentUser: false,
    },
    {
      id: 17,
      sender: "Grace Miller",
      content: "Got the label, thanks!",
      timestamp: "10:10 AM",
      isCurrentUser: true,
    },
    {
      id: 18,
      sender: "Jack Raymonds",
      content: "Great! You should receive the replacement within 5-7 business days. We appreciate your patience.",
      timestamp: "10:12 AM",
      isCurrentUser: false,
    },
    {
      id: 19,
      sender: "Grace Miller",
      content: "That sounds good. I'll wait for the replacement",
      timestamp: "10:15 AM",
      isCurrentUser: true,
    },
    {
      id: 20,
      sender: "Jack Raymonds",
      content: "Perfect. Don't hesitate to reach out if you need any further assistance. Have a great day!",
      timestamp: "10:17 AM",
      isCurrentUser: false,
    },
    {
      id: 21,
      sender: "Grace Miller",
      content: "You too, thanks for all your help!",
      timestamp: "10:20 AM",
      isCurrentUser: true,
    },
    {
      id: 22,
      sender: "Jack Raymonds",
      content: "It was my pleasure assisting you today. We value your business and thank you for your understanding.",
      timestamp: "10:25 AM",
      isCurrentUser: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: "Grace Miller",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true,
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Topbar
        title="Title of the Dispute"
        description="ID: 12345623"
      />
      <div className="flex flex-col h-[calc(90vh-80px)] mt-[60px]">
        <div className="h-[90px] border-b border-[#DFDFDF] flex items-center w-full">
          <div className="flex-shrink-0 relative">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white dark:text-dark-text text-base-medium">
                T
              </span>
            </div>
            <div className="absolute bottom-0 right-0 bg-[#00A3FF] w-[14px] h-[14px] rounded-full"></div>
          </div>
          <div className="ml-4 flex flex-col gap-2">
            <p className="text-paragraph dark:text-dark-text text-[20px] font-[500] leading-[23.44px]">Title of the Dispute</p>
            <span className="text-[14px] font-[400] leading-[16.41px] text-primary">ID: 12363622</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-6 lg:px-8 mt-4">
          <div className="max-w-6xl mx-auto space-y-6 mb-12">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 md:max-w-[70%] ${
                    message.isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white dark:text-dark-text text-base-medium">
                        {message.sender.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className={`flex flex-col ${message.isCurrentUser ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 md:gap-4 mb-1">
                        {message.isCurrentUser ? (
                          <>
                            <span className="text-[#8A8F9B] dark:text-dark-2 text-[10px] md:text-[12px] font-[400] leading-[14.52px]">
                              {message.timestamp}
                            </span>
                            <span className="text-paragraph dark:text-dark-text text-base-medium md:text-[16px] lg:text-base-medium">
                              {message.sender}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-paragraph dark:text-dark-text text-base-medium md:text-[16px] lg:text-base-medium">
                              {message.sender}
                            </span>
                            <span className="text-[#8A8F9B] dark:text-dark-2 text-[10px] md:text-[12px] font-[400] leading-[14.52px]">
                              {message.timestamp}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className={`p-3 md:p-4 ${
                        message.isCurrentUser
                          ? "bg-primary text-white dark:text-dark-text rounded-b-[14px] rounded-tl-[14px]"
                          : "bg-white border border-[#E7E7E7] dark:bg-dark-input-bg text-paragraph dark:text-dark-text rounded-b-[14px] rounded-tr-[14px]"
                      }`}
                    >
                      <p className="text-[14px] md:text-body-normal break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t border-[#E8EAEE] bg-white dark:bg-dark-bg dark:border-dark-border px-2 md:px-4 py-3 md:py-4 absolute bottom-0 right-0 md:left-10 left-0 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 md:gap-4 justify-between items-center">
              <div className="flex-1 bg-white-2 dark:bg-dark-input-bg rounded-lg">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-2 md:p-4 text-paragraph dark:text-dark-text placeholder:text-[#A0A0A0] dark:placeholder:text-dark-2 text-[16px] md:text-[20px] lg:text-[24px] font-[400] leading-normal md:leading-[29.05px] resize-none focus:outline-none "
                />
              </div>
              <Paperclip className="cursor-pointer dark:text-dark-text" />
              <Button
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary-500 text-white dark:text-dark-text h-10 md:h-12 px-4 md:px-6 rounded-[12px] flex items-center gap-1 md:gap-2 whitespace-nowrap"
              >
                <span className="text-[16px] md:text-[20px] font-[500] leading-[24.2px] hidden md:inline">Send</span>
                <Send size={20} className="w-[16px] h-[16px] md:w-[20px] md:h-[20px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DisputeChat;
