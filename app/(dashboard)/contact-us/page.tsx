"use client";

import React, { useState } from "react";
import Topbar from "../../../components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, Instagram, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

// Validation schema
const contactSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
});

const ContactUsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const validateField = (name: string, value: string) => {
    try {
      contactSchema.shape[name as keyof typeof contactSchema.shape].parse(value);
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return "Invalid input";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (touchedFields[field as keyof typeof touchedFields]) {
      setErrors(prev => ({
        ...prev,
        [field]: validateField(field, value)
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, formData[field as keyof typeof formData])
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      message: validateField("message", formData.message),
      phone: formData.phone ? validateField("phone", formData.phone) : "",
    };

    setErrors(newErrors);
    setTouchedFields({
      name: true,
      email: true,
      phone: true,
      message: true,
    });

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== "")) {
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/send-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message Received",
        description: "Thank you for reaching out! We've received your message and will contact you shortly via email. Please check your inbox for updates.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setTouchedFields({
        name: false,
        email: false,
        phone: false,
        message: false,
      });
      setErrors({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              <div className="space-y-1">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Your Name"
                  className={`h-[53px] w-full text-base-regular border-b ${errors.name ? 'border-red-500' : 'border-[#D1D5DB]'} dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none`}
                />
                {touchedFields.name && errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="Email Address"
                  className={`h-[53px] w-full text-base-regular border-b ${errors.email ? 'border-red-500' : 'border-[#D1D5DB]'} dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none`}
                />
                {touchedFields.email && errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder="Phone Number (optional)"
                  className={`h-[53px] w-full text-base-regular border-b ${errors.phone ? 'border-red-500' : 'border-[#D1D5DB]'} dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none`}
                />
                {touchedFields.phone && errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                onBlur={() => handleBlur("message")}
                placeholder="Message"
                className={`h-[80px] w-full text-base-regular border-b ${errors.message ? 'border-red-500' : 'border-[#D1D5DB]'} dark:border-dark-border dark:bg-transparent dark:text-dark-text placeholder:text-black dark:placeholder:text-dark-text/40 focus:outline-none resize-none`}
              />
              {touchedFields.message && errors.message && (
                <p className="text-sm text-red-500">{errors.message}</p>
              )}
            </div>
            <div>
              <Button
                type="submit"
                disabled={isLoading || !formData.name || !formData.email || !formData.message}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white dark:text-dark-text text-[16px] font-[600] px-6 md:px-10 rounded-lg leading-[18.75px] h-[63px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    Leave us a Message <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ContactUsPage;
