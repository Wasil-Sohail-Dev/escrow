import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  } from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import React from 'react'


interface FilterButtonProps {
    icon: React.ReactNode;
    label: string;
    options: Array<{ label: string; color?: string } | string>;
  }
  
 export default function FilterButton({ icon, label, options }: FilterButtonProps) {
    return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 md:h-10 items-center gap-2 px-3 md:px-4 py-2 rounded-lg border dark:border-dark-border bg-white dark:bg-dark-input-bg hover:bg-gray-50 dark:hover:bg-dark-2/10 min-w-[120px] md:min-w-0">
        {icon}
        <span className="text-[12px] md:text-[14px] font-[400] text-[#4B5563] dark:text-dark-text whitespace-nowrap">
          {label}
        </span>
        <ChevronDown className="h-4 w-4 text-[#4B5563] dark:text-dark-text" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-dark-bg border dark:border-dark-border">
        {options.map((option, index) => (
          <DropdownMenuItem
            key={index}
            className={cn(
              "text-[12px] md:text-[14px] font-[400] dark:focus:bg-dark-2/20 dark:hover:bg-dark-2/20",
              typeof option === "object" && option.color && `text-[${option.color}]`
            )}
          >
            {typeof option === "object" ? option.label : option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}