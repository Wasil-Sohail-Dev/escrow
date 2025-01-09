"use client";
import React, { useState } from "react";
import Topbar from "../components/Topbar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";
import WorkSubmissionModal from "@/components/modals/WorkSubmissionModal";
import RevisionRequestModal from "@/components/modals/RevisionRequestModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MilestoneFile {
  name: string;
  size: string;
  type: "pdf" | "xls";
}

interface Milestone {
  title: string;
  payment: string;
  deliveryDate: string;
  status: "completed" | "pending";
  description: string[];
  files: MilestoneFile[];
}

const milestones: Milestone[] = [
  {
    title: "Logo Concepts",
    payment: "$200",
    deliveryDate: "12/20/2024",
    status: "completed",
    description: [
      "Manage accounts worth $4.7 million in annual sales",
      "Selected to train 3 new account managers on the basis of my stellar track record",
      "Increased business revenue by 150% by implementing new customer service initiative",
      "Recovered 15 dormant accounts worth a total of $500,000",
    ],
    files: [
      { name: "New file.pdf", size: "1.2 MB", type: "pdf" },
      { name: "Folder.xls", size: "8 MB", type: "xls" },
    ],
  },
  {
    title: "Finalized Logo and Guidelines",
    payment: "$200",
    deliveryDate: "12/21/2024",
    status: "pending",
    description: [
      "Networked effectively with clients, increasing revenue by 47% in just 5 months",
      "Selected as Employee of the Month as well as Top Salesperson 3 times for exceeding sales objectives",
    ],
    files: [],
  },
  {
    title: "Marketing Material Templates",
    payment: "$200",
    deliveryDate: "12/21/2024",
    status: "pending",
    description: [
      "Monitored client accounts, analyzed incomings and outgoings, and performed daily, weekly, and annual forecasts",
      "Exceeded 2014 sales target by 47%",
      "Strategized with team to win market share from competitors",
    ],
    files: [
      { name: "New file.pdf", size: "8 MB", type: "pdf" },
      { name: "Folder.xls", size: "8 MB", type: "xls" },
    ],
  },
];

const ContactDetails = () => {
  const router = useRouter();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  return (
    <>
      <Topbar
        title="Graphic Designing"
        description="Contract Details and Information"
      />
      <div className="flex-1 mt-[85px]">
        <div className="flex lg:flex-row flex-col justify-between gap-6 lg:gap-0 w-full">
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex justify-between items-center">
              <h2 className="text-paragraph dark:text-white text-heading3-bold">
                Graphic Designing
              </h2>
            <div className="flex gap-2">
              <Button variant="secondary" className="text-base-medium text-white rounded-[12px]">Decline</Button>
                <Button className="text-base-medium text-white rounded-[12px]">Accept</Button>
              </div>
            </div>
            <div className="border-b border-[#D0D0D04D] dark:border-dark-border pb-6">
              <p className="text-sm text-paragraph dark:text-dark-2 text-small-medium font-[400]">
                Contract ID: 144453
              </p>
              <p className="mt-2 text-paragraph dark:text-dark-text text-base-regular">
                This contract involves the creation of a modern logo, brand
                guidelines, and marketing materials for ABC Marketing.
                Deliverables include logo concepts, finalized logo, typography,
                color palette, and templates for business cards and social media
                posts.
              </p>
            </div>
            <div className="border-b border-[#D0D0D04D] dark:border-dark-border pb-6 flex justify-between">
              <div className="flex flex-col gap-1 text-paragraph dark:text-dark-text text-base-regular">
                <div className="flex items-center gap-2">
                  <p className="">Duration:</p>
                  <p className="">4 Week</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>Project Cost:</p>
                  <p className="">$150,000.00</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>Start Date:</p>
                  <p className="">14th January, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>End Date:</p>
                  <p className="">14th November, 2024</p>
                </div>
              </div>

              <Link href="/transection-details">
                <Button className="text-[14px] font-[700] leading-[20px] bg-primary text-white dark:bg-primary dark:text-dark-text px-2 md:px-6 rounded-lg hover:bg-primary-500 dark:hover:bg-primary-500 transition-colors md:h-[46px] h-[36px]">
                  Payment History
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex lg:flex-col flex-row justify-between lg:justify-start gap-8">
            <div>
              <h3 className="text-[12px] font-[400] leading-[16px] text-paragraph dark:text-dark-2 mb-1">
                FROM - CLIENT
              </h3>
              <div className="space-y-0.5">
                <p className="text-[20px] font-bold leading-[28px] dark:text-dark-text">
                  Munazza Arshad
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  UI Designer
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  Fsd, Pakistan
                </p>
                <p className="text-[14px] font-[400] leading-[19px] text-paragraph dark:text-dark-2">
                  Xyz@gmail.com
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-[400] leading-[16px] text-paragraph dark:text-dark-2 mb-1">
                TO - VENDOR
              </h3>
              <div className="space-y-0.5">
                <p className="text-[20px] font-bold leading-[28px] dark:text-dark-text">
                  Talha Baig
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  Graphic Designer
                </p>
                <p className="text-[14px] font-[400] leading-[19px] dark:text-dark-text">
                  Fsd, Pakistan
                </p>
                <p className="text-[14px] font-[400] leading-[19px] text-paragraph dark:text-dark-2">
                  xyz@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Milestones Section */}
        <div className="flex flex-col gap-6 max-w-3xl mt-5">
          <p className="text-paragraph dark:text-dark-text text-[15px] font-[500] leading-[17px]">
            Milestones
          </p>

          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="flex md:flex-row flex-col md:justify-between"
            >
              <div className="flex flex-col gap-3 relative pl-8 max-w-md">
                <div
                  className={`w-[13px] h-[13px] rounded-full ${
                    milestone.status === "completed"
                      ? "bg-primary"
                      : "bg-paragraph dark:bg-dark-2"
                  } absolute left-[0px] top-1`}
                ></div>
                <div
                  className={`absolute left-[5px] top-2 bottom-0 w-[2px]  ${
                    milestone.status === "completed"
                      ? "bg-primary"
                      : "bg-paragraph dark:bg-dark-2"
                  }`}
                ></div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-[16px] font-[600] leading-[19px] text-paragraph dark:text-dark-text">
                        {milestone.title}
                      </span>
                      <span className="text-paragraph dark:text-dark-2 text-[12px] font-[400] leading-[16px]">
                        (Milestone Payment: {milestone.payment})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-paragraph dark:text-dark-2 text-[12px] font-[400] leading-[16px]">
                        Delivery Date: {milestone.deliveryDate}
                      </span>
                      <button
                        onClick={() => setIsWorkModalOpen(true)}
                        className="text-primary underline text-[12px] font-[600] leading-[19px]"
                      >
                        View Submitted Work
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-1">
                  <ul className="space-y-2">
                    {milestone.description.map((desc, i) => (
                      <div className="flex items-start gap-2" key={i}>
                        <span className="w-1 h-1 rounded-full bg-paragraph dark:bg-dark-2 mt-2"></span>
                        <li className="text-paragraph dark:text-dark-text text-[14px] font-[400] leading-[19px]">
                          {desc}
                        </li>
                      </div>
                    ))}
                  </ul>

                  {milestone.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {milestone.files.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center h-[56px] justify-between px-4 rounded-lg border dark:border-dark-border dark:bg-dark-input-bg"
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src="/assets/PDF.svg"
                              alt="pdf"
                              width={31}
                              height={36}
                            />
                            <div>
                              <p className="text-[14px] font-[500] leading-[19px] text-paragraph dark:text-dark-text">
                                {file.name}
                              </p>
                              <p className="text-[12px] font-[400] leading-[16px] text-[#8A8F9B] dark:text-dark-2">
                                {file.size}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="dark:hover:bg-dark-2/20"
                          >
                            <Download
                              className="dark:text-dark-icon"
                              style={{ width: "20px", height: "20px" }}
                            />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className=" mt-4 md:mt-0 flex justify-end">
                {/* <Button
                  onClick={() => setIsRevisionModalOpen(true)}
                  className={`text-[14px] font-[700] leading-[20px] ${
                    milestone.status === "completed"
                      ? "bg-primary hover:bg-primary-500 dark:bg-primary dark:hover:bg-primary-500 dark:text-dark-text"
                      : "bg-[#CACED8] hover:bg-[#CACED8]/90 dark:bg-[#CACED8] dark:hover:bg-[#CACED8]/90 dark:text-white"
                  } text-white px-2 md:px-6 rounded-lg transition-colors md:h-[46px] h-[36px]`}
                >
                  Request Review
                </Button> */}
                <Button
                  onClick={() => {
                    router.push("/milestone-submission");
                  }}
                  className={`text-[14px] font-[700] leading-[20px] ${
                    milestone.status === "completed"
                      ? "bg-primary hover:bg-primary-500 dark:bg-primary dark:hover:bg-primary-500 dark:text-dark-text"
                      : "bg-[#CACED8] hover:bg-[#CACED8]/90 dark:bg-[#CACED8] dark:hover:bg-[#CACED8]/90 dark:text-white"
                  } text-white px-6 md:px-10 rounded-lg transition-colors md:h-[46px] h-[36px]`}
                >
                  Submit Tast
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WorkSubmissionModal
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        setIsRevisionModalOpen={() => setIsRevisionModalOpen(true)}
      />
      <RevisionRequestModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
      />
    </>
  );
};

export default ContactDetails;
