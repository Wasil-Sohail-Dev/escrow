"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Topbar from "../../../components/dashboard/Topbar";

export default function MakePayment() {
  return (
    <>
      <Topbar
        title="Make Payment"
        description=" Add the following details in order to complete your payment."
      />
      <div className="flex flex-col lg:flex-row gap-[60px] lg:gap-[140px] mt-[45px] lg:mt-[85px] px-4 lg:px-0">
        <div className="w-full lg:max-w-[530px]">
          <h1 className="text-[22px] lg:text-[30px] font-bold mb-2 dark:text-dark-text">
            Let's Make Payment
          </h1>
          <p className="text-[13px] lg:text-[14px] leading-[21px] text-[#575757] dark:text-dark-text/60 mb-6 lg:mb-8 font-[400]">
            To start your subscription, input your card details to make payment.
            You will be redirected to your banks authorization page .
          </p>

          <form className="space-y-4 w-full">
            <div className="flex w-full flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex-1 space-y-2">
                <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                  Project ID
                </label>
                <Input
                  type="text"
                  value="38489"
                  disabled
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                />
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                  Vendor Name
                </label>
                <Input
                  type="text"
                  value="Munazza"
                  disabled
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                Project Title
              </label>
              <Input
                type="text"
                value="Munazza Arshad"
                disabled
                className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text/80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                Cardholder's Name
              </label>
              <Input
                type="text"
                placeholder="Enter cardholder name"
                className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text placeholder:text-[#676767BD] dark:placeholder:text-dark-text/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                Card Number
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="h-[48px] lg:h-[58px] pl-16 lg:pl-20 bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text placeholder:text-[#676767BD] dark:placeholder:text-dark-text/40"
                />
                <Image
                  src="/assets/mastercard.png"
                  alt="Mastercard"
                  width={53}
                  height={29}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 lg:w-[53px]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex-1 space-y-2">
                <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                  Expiry Date
                </label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text placeholder:text-[#676767BD] dark:placeholder:text-dark-text/40"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[15px] lg:text-[17px] text-[#292929] dark:text-dark-text font-semibold">
                  CVC
                </label>
                <Input
                  type="text"
                  placeholder="000"
                  className="h-[48px] lg:h-[58px] bg-[#EEEEEE] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-lg text-[16px] lg:text-[19.94px] font-[400] leading-[24.13px] text-[#292929] dark:text-dark-text placeholder:text-[#676767BD] dark:placeholder:text-dark-text/40"
                />
              </div>
            </div>
            <Button className="w-full h-[48px] lg:h-[58px] bg-primary hover:bg-primary/90 text-white dark:text-dark-text rounded-lg transition-colors text-[16px] lg:text-[20.81px] font-[700] leading-[25.18px]">
              Proceed
            </Button>
          </form>
        </div>

        <div className="w-full lg:w-[500px]">
          <div className="bg-[#D4F1E9] dark:bg-dark-input-bg border border-[#E8EAEE] dark:border-dark-border rounded-md p-4 lg:p-6">
            <h2 className="text-[18px] lg:text-[22px] text-center font-semibold mb-4 lg:mb-6 text-[#292929] dark:text-dark-text">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-body-medium text-[#474747] dark:text-dark-text">
                  Balance amount
                </span>
                <span className="text-body-normal text-[#474747] dark:text-dark-text">
                  $ 68
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-body-medium text-[#474747] dark:text-dark-text">
                  Escrow Tax (21%)
                </span>
                <span className="text-body-normal text-[#474747] dark:text-dark-text">
                  $ 14.28
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-body-medium text-[#474747] dark:text-dark-text">
                  Bank Fee
                </span>
                <span className="text-body-normal text-[#474747] dark:text-dark-text">
                  $ 10
                </span>
              </div>

              <div className="pt-4 border-t border-[#474747] dark:border-dark-border">
                <div className="flex justify-between items-center">
                  <span className="text-body-medium font-medium text-[#474747] dark:text-dark-text">
                    Total:
                  </span>
                  <span className="text-body-normal font-medium text-[#474747] dark:text-dark-text">
                    $ 82.28
                  </span>
                </div>
              </div>
            </div>

            <Button className="w-full h-[48px] lg:h-[58px] bg-[#00BA88] hover:bg-[#00BA88]/90 text-white dark:text-dark-text rounded-lg mt-4 lg:mt-6 transition-colors font-[700] text-[18px] lg:text-[24px] leading-[19px]">
              Make Payment
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
