import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'
import { exportPaymentHistoryToExcel, exportPaymentHistoryToTxt, exportDisputeHistoryToExcel, exportDisputeHistoryToTxt } from '@/lib/helpers/exportHelpers'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileSpreadsheet, FileText } from 'lucide-react'

interface HeadBarProps {
  title: string;
  buttonName: string;
  payments?: any[];
  disputes?: any[];
  onExport?: () => void;
  type?: 'payment' | 'dispute';
}

const HeadBar = ({ title, buttonName, payments, disputes, onExport, type = 'payment' }: HeadBarProps) => {
  const handleExport = (exportType: 'excel' | 'txt') => {
    if (onExport) {
      onExport();
      return;
    }
    
    if (type === 'dispute' && disputes) {
      if (exportType === 'excel') {
        exportDisputeHistoryToExcel(disputes);
      } else {
        exportDisputeHistoryToTxt(disputes);
      }
    } else if (type === 'payment' && payments) {
      if (exportType === 'excel') {
        exportPaymentHistoryToExcel(payments);
      } else {
        exportPaymentHistoryToTxt(payments);
      }
    }
  };

  return (
    <div className="flex items-center justify-between mb-10">
      <h1 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold leading-[29px] text-paragraph dark:text-dark-text">
        {title}
      </h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:text-dark-text text-[14px] md:text-[16px] font-[700] h-[38px] md:h-[42px] px-4 md:px-6 rounded-lg flex items-center gap-2"
          >
            <Image src="/assets/export.svg" alt="export" width={18} height={16} className="w-4 h-4 md:w-[18px] md:h-[16px]" /> 
            <span className="hidden md:inline">{buttonName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px] dark:bg-dark-bg dark:border-dark-border">
          <DropdownMenuItem 
            onClick={() => handleExport('excel')}
            className="cursor-pointer flex items-center gap-2 dark:text-dark-text dark:hover:bg-white/5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleExport('txt')}
            className="cursor-pointer flex items-center gap-2 dark:text-dark-text dark:hover:bg-white/5"
          >
            <FileText className="w-4 h-4" />
            <span>Text (.txt)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default HeadBar