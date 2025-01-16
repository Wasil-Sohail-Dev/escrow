"use client";

import React from "react";
import Topbar from "../../../components/dashboard/Topbar";
import Image from "next/image";
import Link from "next/link";

const PreBuildContracts = () => {
  return (
    <>
      <Topbar
        title="Pre-Build Contracts"
        description="Add the following details in order to create your contract"
      />
      <div className="mt-[85px]">
        <div className="w-full">
          <div className="mb-8 border-b border-[#D0D0D0] dark:border-dark-border pb-4">
            <h1 className="text-[22px] lg:text-[24px] font-bold mb-2 text-[#292929] dark:text-dark-text">
              Choose Contract Template
            </h1>
          </div>

          <div className="space-y-6">
            <Link href="/pre-build-details">
            <div className="group bg-[#F8F8F8] hover:bg-[#F3F4F6] dark:bg-dark-input-bg dark:hover:bg-dark-2/20 rounded-xl p-4 cursor-pointer transition-colors">
              <Image
                src={"/assets/download2.svg"}
                alt="upload"
                width={24}
                height={24}
                className="mb-2"
              />
              <h3 className="text-[24px] font-[600] text-[#292929] dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary transition-colors">
                Home Renovation
              </h3>
              <p className="text-[16px] font-[400] text-[#64748B] dark:text-dark-text/60">
                Lorem ipsum dolor sit amet consectetur adipisicing elit aliqua
                dolor sit amet.
              </p>
            </div>
            </Link>
            <div className="group bg-[#F8F8F8] hover:bg-[#F3F4F6] dark:bg-dark-input-bg dark:hover:bg-dark-2/20 rounded-xl p-4 cursor-pointer transition-colors">
              <Image
                src={"/assets/download2.svg"}
                alt="upload"
                width={24}
                height={24}
                className="mb-2"
              />
              <h3 className="text-[24px] font-[600] text-[#292929] dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary transition-colors">
                Home Renovation
              </h3>
              <p className="text-[16px] font-[400] text-[#64748B] dark:text-dark-text/60">
                Lorem ipsum dolor sit amet consectetur adipisicing elit aliqua
                dolor sit amet.
              </p>
            </div>
            <div className="group bg-[#F8F8F8] hover:bg-[#F3F4F6] dark:bg-dark-input-bg dark:hover:bg-dark-2/20 rounded-xl p-4 cursor-pointer transition-colors">
              <Image
                src={"/assets/download2.svg"}
                alt="upload"
                width={24}
                height={24}
                className="mb-2"
              />
              <h3 className="text-[24px] font-[600] text-[#292929] dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary transition-colors">
                Home Renovation
              </h3>
              <p className="text-[16px] font-[400] text-[#64748B] dark:text-dark-text/60">
                Lorem ipsum dolor sit amet consectetur adipisicing elit aliqua
                dolor sit amet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreBuildContracts;
