import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

interface HeadBarProps {
  title: string;
  buttonName: string;
  onExport?: () => void;
}

const HeadBar = ({ title, buttonName, onExport }: HeadBarProps) => {
  return (
    <div className="flex items-center justify-between mb-10">
      <h1 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold leading-[29px] text-paragraph dark:text-dark-text">
        {title}
      </h1>
      <Button 
        onClick={onExport}
        className="bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:text-dark-text text-[14px] md:text-[16px] font-[700] h-[38px] md:h-[42px] px-4 md:px-6 rounded-lg flex items-center gap-2"
      >
        <Image src="/assets/export.svg" alt="export" width={18} height={16} className="w-4 h-4 md:w-[18px] md:h-[16px]" /> 
        <span className="hidden md:inline">{buttonName}</span>
      </Button>
    </div>
  )
}

export default HeadBar