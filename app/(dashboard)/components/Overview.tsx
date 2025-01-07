"use client";

import Image from "next/image";
import { useState } from "react";
import ProjectCard from "../components/ProjectCard";

import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";

type TabOption = "active" | "dispute" | "completed" | "all";

const Overview = ({ dispute }: { dispute?: boolean }) => {
  const [activeTab, setActiveTab] = useState<TabOption>("active");

  const getFilteredCount = (tab: TabOption) => {
    switch (tab) {
      case "active":
        return 2;
      case "completed":
        return 8;
      case "all":
        return 11;
      case "dispute":
        return 1;
      default:
        return 0;
    }
  };
  return (
    <>
      <div
        className={`mb-4 flex justify-end ${
          dispute ? "sm:justify-between  sm:flex-row flex-col sm:gap-0 gap-6 items-center" : "justify-end"
        }`}
      >
        {dispute && (
          <div className="flex items-center text-[20px] font-[800] leading-[24px] text-[#3A3A3A] gap-6 dark:text-dark-text">
            Sort by:{" "}
            <span className="text-[14px] font-[500] leading-[16.8px] underline">
              Status
            </span>{" "}
            <span className="text-[14px] font-[500] leading-[16.8px]">|</span>{" "}
            <span className="text-[14px] font-[500] leading-[16.8px] underline">
              Date
            </span>
          </div>
        )}
        <Button
          className={`bg-primary hover:bg-primary/90 px-6 py-6 rounded-md flex items-center gap-2 text-small-medium text-white ${
            dispute
              ? "bg-[#E71D1D] hover:bg-[#E71D1D]/90"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          <Plus />
          Create New Contract
        </Button>
      </div>

      <div
        className="grid lg:grid-cols-4 md:grid-cols-2 max-md:grid-cols-1 
        lg:gap-4 md:gap-4 max-md:gap-3 mb-4"
      >
        <ProjectCard
          title="Total Disputes Raised"
          count={2}
          status="active"
          viewDetailsLink="/home/active"
          dispute={dispute}
        />
        <ProjectCard
          title="Pending Disputes"
          count={8}
          status="completed"
          viewDetailsLink="/home/completed"
          dispute={dispute}
        />
        <ProjectCard
          title="In Progress"
          count={11}
          status="all"
          viewDetailsLink="/home/all"
          dispute={dispute}
        />
        <ProjectCard
          title="Resolved"
          count={1}
          status="dispute"
          viewDetailsLink="/home/dispute"
          dispute={dispute}
        />
      </div>

      {!dispute && (
        <div
          className="flex lg:gap-8 md:gap-6 max-md:gap-4 border-b dark:border-dark-border
        lg:overflow-visible md:overflow-visible max-md:overflow-x-auto 
        max-md:pb-2 max-md:scrollbar-hide"
        >
          {["Active", "Dispute", "Completed", "All"].map((tab) => {
            const tabValue = tab.toLowerCase() as TabOption;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabValue)}
                className={`pb-2 px-1 relative whitespace-nowrap
                lg:text-body-normal md:text-base-regular max-md:text-small-regular ${
                  activeTab === tabValue
                    ? "text-primary dark:text-primary"
                    : "text-[#D7DAE1] dark:text-dark-text/60"
                }`}
              >
                {tab}
                {activeTab === tabValue && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className=" rounded-lg mt-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2 max-md:gap-2">
            <h2
              className="lg:text-[22px] md:text-[20px] max-md:text-heading4-medium 
              leading-[27.5px] font-bold dark:text-dark-text"
            >
              {dispute ? "In Progress Dispute" : "Active Projects"}
            </h2>
            <span
              className="text-white rounded-full 
              lg:w-6 lg:h-6 md:w-5 md:h-5 max-md:w-5 max-md:h-5
              lg:text-subtle-semibold md:text-small-semibold max-md:text-tiny-medium
              flex items-center justify-center mt-1 bg-[#EC1A1A]"
            >
              {getFilteredCount(activeTab)}
            </span>
          </div>
          <button
            className="lg:text-base1-semibold md:text-base-semibold max-md:text-small-semibold 
            underline flex items-center gap-2 dark:text-dark-text"
          >
            See Details <ChevronDown size={20} />
          </button>
        </div>

        <div
          className={`mt-10 flex justify-between ${
            dispute ? "items-center" : ""
          }`}
        >
          <div className="flex lg:gap-6 md:gap-5 max-md:gap-4 text-start">
            <Image
              src="/assets/Icon.svg"
              alt="project"
              width={85}
              height={85}
              className="lg:w-[85px] md:w-[75px] max-md:w-[65px]
                lg:h-[85px] md:h-[75px] max-md:h-[65px]
                dark:invert"
            />
            <div className="flex flex-col lg:gap-2 md:gap-1.5 max-md:gap-1">
              <h2
                className="lg:text-heading3-reg md:text-heading4-medium max-md:text-base-medium
                dark:text-dark-text"
              >
                ID: ESC 3345
              </h2>
              <p
                className="lg:text-heading4-light md:text-body-normal max-md:text-base-regular 
                text-secondary-heading dark:text-dark-text/60"
              >
                Munazza Arshad
              </p>
            </div>
          </div>

          {!dispute ? (
            <div className="flex flex-col lg:gap-2 md:gap-1.5 max-md:gap-1 items-end">
              <h2
                className="lg:text-body-bold md:text-body-semibold max-md:text-base-semibold
              dark:text-dark-text"
              >
                $1,234.00
              </h2>
              <p
                className="lg:text-small-regular md:text-small-regular max-md:text-tiny-medium 
              text-secondary-heading dark:text-dark-text/60"
              >
                Aug 8,2024
              </p>
            </div>
          ) : (
            <p className="text-base-regular text-[#7B878C] dark:text-dark-text items-end justify-end ">
              Date Created: Aug 8,2024
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Overview;
