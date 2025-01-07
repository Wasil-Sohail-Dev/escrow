"use client";

import Link from "next/link";

interface ProjectStats {
  title: string;
  count: number;
  status: "active" | "completed" | "all" | "dispute";
  viewDetailsLink: string;
  dispute?: boolean;
}

export default function ProjectCard({ title, count, status, viewDetailsLink, dispute }: ProjectStats) {
  const statusColors = {
    active: "text-[#0769F5]",
    completed: "text-[#F29A2E]",
    all: "text-[#4CE13F]",
    dispute: "text-[#EB2E2E]"
  };

  return (
    <div className="bg-[#DADADA33] p-4 rounded-lg shadow-sm flex-1 text-center 
      lg:w-auto max-md:w-full max-md:flex-none">
      <div className="flex flex-col gap-1">
        <h3 className={`text-heading4-medium ${dispute ? " dark:text-dark-text" : statusColors[status]} 
          lg:text-heading4-medium md:text-base-medium max-md:text-base-medium`}>
          {title}
        </h3>
        <p className="text-heading3-bold lg:text-heading3-bold 
          md:text-heading4-medium max-md:text-heading4-medium dark:text-dark-text">{count}</p>
        <Link 
          href={viewDetailsLink}
          className="text-subtle-medium font-[400] text-secondary-heading underline
            lg:text-subtle-medium md:text-small-regular max-md:text-small-regular dark:text-dark-text/60"
        >
          View Details
        </Link>
      </div>
    </div>
  );
} 