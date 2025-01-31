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
    const getOptionColor = (option: FilterOption) => {
        if (typeof option === 'object' && option.color) {
            return option.color;
        }
        return undefined;
    };

    const getOptionLabel = (option: FilterOption) => {
        if (typeof option === 'object') {
            return option.label;
        }
        return option;
    };

    return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={cn(
          "flex h-8 md:h-10 items-center gap-2 px-3 md:px-4 py-2 rounded-lg",
          "border dark:border-dark-border",
          "bg-white dark:bg-dark-input-bg",
          "hover:bg-gray-50 dark:hover:bg-dark-2/10",
          "min-w-[120px] md:min-w-0",
          "focus:outline-none focus:ring-2 focus:ring-[none] focus:ring-offset-0"
        )}
      >
        {icon}
        <span className="text-[12px] md:text-[14px] font-[400] text-[#4B5563] dark:text-dark-text whitespace-nowrap">
          {selectedOption || label}
        </span>
        <ChevronDown className="h-4 w-4 text-[#4B5563] dark:text-dark-text" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="bg-white dark:bg-dark-bg border dark:border-dark-border min-w-[150px]"
      >
        {options.map((option, index) => {
          const optionLabel = getOptionLabel(option);
          const optionColor = getOptionColor(option);
          
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => onSelect(optionLabel)}
              className={cn(
                "text-[12px] md:text-[14px] font-[400]",
                "cursor-pointer",
                "dark:focus:bg-dark-2/20 dark:hover:bg-dark-2/20",
                "transition-colors",
                selectedOption === optionLabel && "bg-primary/10",
                optionColor ? `text-[${optionColor}]` : "text-[#4B5563] dark:text-dark-text"
              )}
            >
              <span className="flex items-center gap-2">
                {optionColor && (
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: optionColor }}
                  />
                )}
                {optionLabel}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}