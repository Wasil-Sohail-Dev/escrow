import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";

const DATE_OPTIONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 3 months",
  "Last 6 months",
  "Last Year",
];

interface Payment {
  _id: string;
  totalAmount: number;
  escrowAmount: number;
  releasedAmount: number;
  status: string;
  createdAt: string;
}

interface PaymentCardProps {
  title: string;
  amount: string;
  description: string;
  progressColor: string;
  percentage: number;
}

const PaymentCard = ({
  title,
  amount,
  description,
  progressColor,
  percentage,
}: PaymentCardProps) => (
  <div
    className="bg-[#DADADA33] p-4 rounded-lg flex flex-row justify-between items-center
    lg:p-4 md:p-3 max-md:p-3 dark:border dark:border-dark-border"
  >
    <div>
      <h3
        className="text-sm font-bold text-[#525252] dark:text-dark-text
        lg:text-sm md:text-xs max-md:text-xs"
      >
        {title}
      </h3>
      <p
        className="text-heading3-bold font-semibold mt-1 dark:text-dark-text
        lg:text-heading3-bold md:text-heading4-medium max-md:text-heading4-medium"
      >
        {amount}
      </p>
      <p
        className="text-small-medium mt-1 text-[#676767] dark:text-dark-text/60
        lg:text-small-medium md:text-small-regular max-md:text-small-regular"
      >
        {description}
      </p>
    </div>
    <div style={{ width: 60, height: 60 }}>
      <CircularProgressbar
        value={percentage}
        strokeWidth={20}
        styles={buildStyles({
          rotation: 0,
          strokeLinecap: "round",
          pathTransitionDuration: 0.5,
          pathColor: progressColor,
          textColor: progressColor,
          trailColor: "#E4E8EF",
        })}
      />
    </div>
  </div>
);

interface PaymentOverviewProps {
  show: boolean;
  payments?: any[];
}

export default function PaymentOverview({
  show,
  payments = [],
}: PaymentOverviewProps) {
  console.log(payments, "payments");
  
  const [selectedDateOption, setSelectedDateOption] = useState("Last 30 days");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);

  useEffect(() => {
    filterPayments();
  }, [selectedDateOption, dateRange, payments]);

  const filterPayments = () => {
    if (!payments.length) {
      setFilteredPayments([]);
      return;
    }

    let filtered = [...payments];

    if (startDate && endDate) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    } else {
      const today = new Date();
      const filterDate = new Date();

      switch (selectedDateOption) {
        case "Last 7 days":
          filterDate.setDate(today.getDate() - 7);
          break;
        case "Last 30 days":
          filterDate.setDate(today.getDate() - 30);
          break;
        case "Last 3 months":
          filterDate.setMonth(today.getMonth() - 3);
          break;
        case "Last 6 months":
          filterDate.setMonth(today.getMonth() - 6);
          break;
        case "Last Year":
          filterDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          filterDate.setDate(today.getDate() - 30);
      }

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= filterDate && paymentDate <= today;
      });
    }

    setFilteredPayments(filtered);
  };

  const calculatePayments = (payments: Payment[]) => {
    if (!payments.length) {
      return {
        totalAmount: 0,
        escrowAmount: 0,
        releasedAmount: 0,
        totalPercentage: 0,
        escrowPercentage: 0,
        releasedPercentage: 0,
      };
    }
  
    const totalAmount = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    
    const escrowAmount = payments.reduce((sum, payment) => {
      return ["process", "on_hold", "funded", "partially_released", "fully_released"].includes(payment.status)
        ? sum + payment.escrowAmount
        : sum;
    }, 0);
  
    const releasedAmount = payments.reduce((sum, payment) => sum + payment.releasedAmount, 0);
  
    // Avoid division by zero
    const totalPercentage = totalAmount > 0 ? 100 : 0;
    const escrowPercentage = totalAmount > 0 ? (escrowAmount / totalAmount) * 100 : 0;
    const releasedPercentage = totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0;
  
    return {
      totalAmount,
      escrowAmount,
      releasedAmount,
      totalPercentage,
      escrowPercentage,
      releasedPercentage,
    };
  };

  const { totalAmount, escrowAmount, releasedAmount, totalPercentage, escrowPercentage, releasedPercentage } =
  calculatePayments(filteredPayments);

const PAYMENT_CARDS = [
  {
    title: "Total Amount",
    amount: `$${totalAmount.toFixed(2)}`,
    description: "Total Amount submitted for project",
    progressColor: "#68E05E",
    percentage: totalPercentage,
  },
  {
    title: "Amount With held",
    amount: `$${escrowAmount.toFixed(2)}`,
    description: "In Escrow",
    progressColor: "#EB2E2E",
    percentage: escrowPercentage,
  },
  {
    title: "Amount Released",
    amount: `$${releasedAmount.toFixed(2)}`,
    description: "Available for Payout",
    progressColor: "#F29A2E",
    percentage: releasedPercentage,
  },
];

  return (
    <div className="mt-8">
      {show && (
        <div className="flex items-center md:justify-between flex-col md:flex-row mb-4 md:gap-0 gap-2">
          <h2
            className="text-[22px] font-bold leading-[28.5px] dark:text-dark-text
            lg:text-[22px] md:text-[20px] max-md:text-[18px] "
          >
            Payment Overview
          </h2>
          <div
            className="flex gap-4 text-[#676767] dark:text-dark-text/60
            lg:gap-4 md:gap-3 max-md:gap-2"
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 text-small-medium px-3 py-1.5 rounded-md 
                dark:bg-dark-bg dark:text-dark-text"
              >
                {selectedDateOption}
                <ChevronDown size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="dark:bg-dark-bg dark:border-dark-border"
              >
                {DATE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => {
                      setSelectedDateOption(option);
                      setDateRange([null, null]);
                    }}
                    className="text-small-medium dark:text-dark-text dark:hover:bg-white/5"
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
                if (update[0] && update[1]) {
                  setSelectedDateOption("Custom Range");
                }
              }}
              isClearable={true}
              placeholderText="Select date range"
              className="flex items-center gap-2 text-small-medium px-3 py-1.5 rounded-md 
                dark:bg-dark-bg dark:text-dark-text border border-input"
            />
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-3 gap-4
        lg:grid-cols-3 md:grid-cols-2 max-md:grid-cols-1
        lg:gap-4 md:gap-3 max-md:gap-3"
      >
        {PAYMENT_CARDS.map((card, index) => (
          <PaymentCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
