"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Topbar from "../../components/Topbar";

interface ProjectCard {
  title: string;
  subtitle: string;
  date: string;
  percentage: number;
}

const projects: ProjectCard[] = [
  {
    title: "Intercom",
    subtitle: "Digital Product Design",
    date: "Apr 25, 2022",
    percentage: 88,
  },
  {
    title: "Zoho Recruit",
    subtitle: "Dashboard UI",
    date: "Apr 12, 2022",
    percentage: 58,
  },
  {
    title: "Healthy Sure",
    subtitle: "Landing Page Website",
    date: "Apr 8, 2022",
    percentage: 30,
  },
];

const ProjectsPage = () => {
  return (
    <>
          <Topbar title="Overview" description="Detailed information about your work" />
    <div className="flex flex-col gap-2 px-10 mt-[85px]">
      {projects.map((project, index) => (
        <div
          key={index}
          className="bg-[#D1D5DB30] rounded-[15px] p-4 flex items-center justify-between shadow-sm relative
            border dark:border-dark-border"
        >
          <div className="absolute top-5 left-0 h-[30px] w-[5px] bg-primary rounded-tr-[10.11px] rounded-br-[10.11px]" />
          <div className="space-y-1">
            <h3 className="font-[600] leading-[24px] text-[20px] dark:text-dark-text">
              {project.title}
            </h3>
            <p className="text-base-regular text-[#0D1829B2] dark:text-dark-text/60">
              {project.subtitle}
            </p>
            <p className="text-subtle-medium font-[400] text-[#0D182999] dark:text-dark-text/40">
              Due Date
            </p>
            <p className="text-subtle-medium text-[#445668] dark:text-dark-text/60 flex items-center gap-1">
              <CalendarDays size={15} className="dark:text-dark-text/60" />{" "}
              {project.date}
            </p>
            <button
              className="bg-primary hover:bg-primary/90 text-subtle-medium text-white rounded-[9px] px-4 py-2 hover:underline
              transition-colors duration-200"
            >
              View Details
            </button>
          </div>
          <div style={{ width: 80, height: 80, marginRight: "30px" }}>
            <CircularProgressbar
              value={project.percentage}
              text={`${project.percentage}%`}
              strokeWidth={12}
              styles={buildStyles({
                rotation: 0,
                strokeLinecap: "round",
                textSize: "17px",
                pathTransitionDuration: 0.5,
                pathColor: "#26B893",
                textColor: "#26B893",
                trailColor: "white",
              })}
            />
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

export default ProjectsPage;
