import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = itemsPerPage;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push(-1);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        if (currentPage < totalPages - 2) pages.push(-1);
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-[#FBFBFB] dark:bg-dark-input-bg dark:border-dark-border mt-10">
      <div className="flex items-center gap-8 text-[12px] sm:text-[14px] order-2 sm:order-1">
        <span className="text-[#4B5563] dark:text-dark-text/60 font-[400]">{totalItems} results</span>
        <span className="text-[#292929] dark:text-dark-text font-[700]">(Page {currentPage} of {totalPages})</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 w-7 sm:h-8 sm:w-8 text-[#4B5563] dark:text-dark-text hover:bg-white/10 dark:hover:bg-dark-2/20 disabled:text-[#4B5563]/40 dark:disabled:text-dark-text/40"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {getPageNumbers().map((pageNum, idx) => (
          pageNum === -1 ? (
            <span key={`separator-${idx}`} className="px-1 sm:px-2 text-[#4B5563] dark:text-dark-text/60 text-[12px] sm:text-[14px]">
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "ghost"}
              onClick={() => onPageChange(pageNum)}
              className={`h-7 w-7 sm:h-8 sm:w-8 text-[12px] sm:text-[14px] font-[400] ${
                currentPage === pageNum 
                  ? "bg-primary hover:bg-primary/90 text-white dark:text-dark-text" 
                  : "text-[#4B5563] dark:text-dark-text hover:bg-white/10 dark:hover:bg-dark-2/20"
              }`}
            >
              {pageNum}
            </Button>
          )
        ))}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-7 w-7 sm:h-8 sm:w-8 text-[#4B5563] dark:text-dark-text hover:bg-white/10 dark:hover:bg-dark-2/20 disabled:text-[#4B5563]/40 dark:disabled:text-dark-text/40"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
} 