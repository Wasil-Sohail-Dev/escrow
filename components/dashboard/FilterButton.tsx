import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  } from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import React from 'react'

type FilterOption = string | { label: string; color?: string };

interface FilterButtonProps {
    icon: React.ReactNode;
    label: string;
    options: FilterOption[];
    selectedOption?: string;
    onSelect: (value: string) => void;
}
  
export default function FilterButton({ icon, label, options, selectedOption, onSelect }: FilterButtonProps) {
    return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 md:h-10 items-center gap-2 px-3 md:px-4 py-2 rounded-lg border dark:border-dark-border bg-white dark:bg-dark-input-bg hover:bg-gray-50 dark:hover:bg-dark-2/10 min-w-[120px] md:min-w-0">
        {icon}
        <span className="text-[12px] md:text-[14px] font-[400] text-[#4B5563] dark:text-dark-text whitespace-nowrap">
          {selectedOption || label}
        </span>
        <ChevronDown className="h-4 w-4 text-[#4B5563] dark:text-dark-text" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-dark-bg border dark:border-dark-border">
        {options.map((option, index) => {
          const optionLabel = typeof option === "string" ? option : option.label;
          const optionColor = typeof option === "object" ? option.color : undefined;
          
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => onSelect(optionLabel)}
              className={cn(
                "text-[12px] md:text-[14px] font-[400] dark:focus:bg-dark-2/20 dark:hover:bg-dark-2/20 cursor-pointer",
                optionColor && `text-[${optionColor}]`,
                selectedOption === optionLabel && "bg-primary/10"
              )}
            >
              {optionLabel}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}