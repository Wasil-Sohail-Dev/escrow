"use client";

import React, { useState } from "react";
import Topbar from "../components/Topbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, Instagram, Twitter } from "lucide-react";

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <>
      <Topbar
        title="Contact Us"
        description="Fill out this form in order to get your queries done"
      />
      <div className="flex justify-center items-center h-screen min-h-[calc(100vh-85px)] px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="mb-8 md:mb-14 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-0">
            <div className="max-w-4xl">
              <p className="text-base-regular text-paragraph dark:text-dark-2 mb-2">
                Get Started
              </p>
              <h1 className="text-[32px] md:text-[45px] lg:text-[60px] font-[600] leading-[1.2] md:leading-[1.3] lg:leading-[70px] dark:text-dark-text">
                Get in touch with us. We're here to assist you.
              </h1>
            </div>

            <div className="flex lg:flex-col gap-4">
              <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full border border-[#B7B7B7] hover:bg-white-2 dark:hover:bg-dark-input-bg transition-colors cursor-pointer">
                <Facebook
                  size={12}
                  className="text-paragraph dark:text-dark-text"
                />
              </div>
              <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full border border-[#B7B7B7] hover:bg-white-2 dark:hover:bg-dark-input-bg transition-colors cursor-pointer">
                <Instagram
                  size={12}
                  className="text-paragraph dark:text-dark-text"
                />
              </div>
              <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full border border-[#B7B7B7] hover:bg-white-2 dark:hover:bg-dark-input-bg transition-colors cursor-pointer">
                <Twitter
                  size={12}
                  className="text-paragraph dark:text-dark-text"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your Name"
                  className="h-[53px] w-full text-base-regular border-b border-[#D1D5DB] dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Email Address"
                  className="h-[53px] w-full text-base-regular border-b border-[#D1D5DB] dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Phone Number (optional)"
                  className="h-[53px] w-full text-base-regular border-b border-[#D1D5DB] dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Message"
                className="h-[80px] w-full text-base-regular border-b border-[#D1D5DB] dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none resize-none"
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white dark:text-dark-text text-[16px] font-[600] px-6 md:px-10 rounded-lg leading-[18.75px] h-[63px] flex items-center justify-center gap-2"
              >
                Leave us a Message <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ContactUsPage;
