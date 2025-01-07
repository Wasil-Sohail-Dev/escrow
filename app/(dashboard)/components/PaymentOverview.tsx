import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

const PAYMENT_CARDS = [
  {
    title: "Total Amount",
    amount: "$20.4K",
    description: "Total Amount summitted for project",
    progressColor: "#68E05E"
  },
  {
    title: "Amount Withheld", 
    amount: "$1.8K",
    description: "In Escrow",
    progressColor: "#EB2E2E"
  },
  {
    title: "Amount Released",
    amount: "$18.2K", 
    description: "Available for Payout",
    progressColor: "#F29A2E"
  }
];

const DATE_OPTIONS = [
  "Last week",
  "Last 90 days", 
  "Last 120 days",
  "Last Year"
];

const PaymentCard = ({ title, amount, description, progressColor }:any) => (
  <div className="bg-[#DADADA33] p-4 rounded-lg flex flex-row justify-between items-center
    lg:p-4 md:p-3 max-md:p-3 dark:border dark:border-dark-border">
    <div>
      <h3 className="text-sm font-bold text-[#525252] dark:text-dark-text
        lg:text-sm md:text-xs max-md:text-xs">
        {title}
      </h3>
      <p className="text-heading3-bold font-semibold mt-1 dark:text-dark-text
        lg:text-heading3-bold md:text-heading4-medium max-md:text-heading4-medium">
        {amount}
      </p>
      <p className="text-small-medium mt-1 text-[#676767] dark:text-dark-text/60
        lg:text-small-medium md:text-small-regular max-md:text-small-regular">
        {description}
      </p>
    </div>
    <div style={{ width: 60, height: 60 }}>
      <CircularProgressbar
        value={75}
        strokeWidth={20}
        styles={buildStyles({
          rotation: 0,
          pathTransitionDuration: 0.5,
          pathColor: progressColor,
          textColor: progressColor,
          trailColor: '#E4E8EF',
        })}
      />
    </div>
  </div>
);

export default function PaymentOverview({ show }: { show: boolean }) {
  return (
    <div className="mt-8">
      {show && <div className="flex items-center md:justify-between flex-col md:flex-row mb-4">
        <h2 className="text-[22px] font-bold leading-[28.5px] dark:text-dark-text
          lg:text-[22px] md:text-[20px] max-md:text-[18px]">
          Payment Overview
        </h2>
        <div className="flex gap-4 text-[#676767] dark:text-dark-text/60
          lg:gap-4 md:gap-3 max-md:gap-2">
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-small-medium px-3 py-1.5 rounded-md 
              dark:bg-dark-bg dark:text-dark-text">
              Last: 30 days
              <ChevronDown size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-dark-bg dark:border-dark-border">
              {DATE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option} className="text-small-medium dark:text-dark-text dark:hover:bg-white/5">
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-small-medium px-3 py-1.5 rounded-md
              dark:bg-dark-bg dark:text-dark-text">
              28 jan, 2021 - 28 Dec, 2021
              <ChevronDown size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-dark-bg dark:border-dark-border">
              {[...Array(5)].map((_, i) => (
                <DropdownMenuItem key={i} className="text-small-medium dark:text-dark-text dark:hover:bg-white/5">
                  28 jan, 2021 - 28 Dec, 2021
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>}

      <div className="grid grid-cols-3 gap-4
        lg:grid-cols-3 md:grid-cols-2 max-md:grid-cols-1
        lg:gap-4 md:gap-3 max-md:gap-3">
        {PAYMENT_CARDS.map((card, index) => (
          <PaymentCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}