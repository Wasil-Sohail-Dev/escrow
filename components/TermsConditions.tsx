"use client";

import React from "react";
import Topbar from "@/components/dashboard/Topbar";
import { useUser } from "@/contexts/UserContext";
const TermsConditions = () => {
  const { user } = useUser();
  return (
    <>
      {user && (
        <Topbar
          title="Terms & Conditions"
          description="Here is a list of all your Terms & Conditions"
        />
      )}
      <div className={`${user ? "mt-[85px]" : "mt-20"}`}>
        <div className="max-w-7xl">
          <div className="mb-8">
            <h1 className="text-[22px] lg:text-[24px] font-bold text-[#292929] dark:text-dark-text">
              Terms and Conditions
            </h1>
          </div>

          <div className="space-y-8">
            {/* Introduction Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                1. INTRODUCTION
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                Welcome to Third Party Escrow. These Terms and Conditions govern
                your use of our platform and services. By accessing or using our
                services, you agree to be bound by these terms. Our platform
                provides secure escrow services for transactions between clients
                and vendors, ensuring safe and reliable payment processing.
              </p>
            </div>

            {/* Service Fees Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                2. SERVICE FEES
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                Our fee structure is transparent and based on the type of
                service:
                <br />
                <br />
                • For Service-Based Contracts: 3-4% of the total transaction
                value
                <br />
                • For Product-Based Contracts: 5-10% of the total transaction
                value
                <br />
                <br />
                These fees cover our escrow services, secure payment processing,
                dispute resolution, and platform maintenance. All fees are
                automatically calculated and displayed before finalizing any
                transaction.
              </p>
            </div>

            {/* Terms of Service Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                3. TERMS OF SERVICE
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                By using our platform, you agree to:
                <br />
                <br />
                • Provide accurate and truthful information
                <br />
                • Maintain the confidentiality of your account credentials
                <br />
                • Comply with all applicable laws and regulations
                <br />
                • Not engage in fraudulent or deceptive practices
                <br />
                • Accept our dispute resolution process when conflicts arise
                <br />
                <br />
                We reserve the right to suspend or terminate accounts that
                violate these terms.
              </p>
            </div>

            {/* Payment Protection Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                4. PAYMENT PROTECTION
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                Our escrow service ensures:
                <br />
                <br />
                • Secure holding of funds until contract conditions are met
                <br />
                • Milestone-based payments for project deliverables
                <br />
                • Protected transactions for both clients and vendors
                <br />
                • Transparent payment tracking and history
                <br />• Dispute resolution support when needed
              </p>
            </div>

            {/* Privacy and Security Section */}
            <div>
              <h2 className="text-[20.5px] font-bold text-[#333333] dark:text-dark-text mb-2 leading-[27.46px]">
                5. PRIVACY AND SECURITY
              </h2>
              <p className="text-[20.5px] leading-[27.46px] font-normal text-[#333333]/80 dark:text-dark-text/80">
                We prioritize the security of your data and transactions
                through:
                <br />
                <br />
                • Advanced encryption protocols
                <br />
                • Secure payment processing systems
                <br />
                • Regular security audits and updates
                <br />
                • Strict data protection policies
                <br />• Compliance with international security standards
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsConditions;
