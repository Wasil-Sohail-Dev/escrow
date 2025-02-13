"use client";

import React from "react";
import Topbar from "../../../components/dashboard/Topbar";
import Image from "next/image";
import Link from "next/link";

const contractTemplates = [
  {
    isSelected: true,
    id: "kitchen-design",
    title: "Kitchen Design",
    description: "Professional kitchen design services including layout planning, material selection, and design implementation.",
    contractId: "KD-2024-001",
    vendorEmail: "",
    startDate: "",
    endDate: "",
    paymentType: "fixed",
    totalPayment: "15000",
    contractType: "services",
    milestones: [
      {
        name: "Initial Consultation",
        amount: "3000",
        description: "Initial meeting, requirement gathering, and space assessment",
        startDate: "",
        endDate: ""
      },
      {
        name: "Design Concept",
        amount: "4000",
        description: "Development of kitchen layout, 3D renderings, and material suggestions",
        startDate: "",
        endDate: ""
      },
      {
        name: "Detailed Planning",
        amount: "5000",
        description: "Final design documentation, material specifications, and construction drawings",
        startDate: "",
        endDate: ""
      },
      {
        name: "Implementation Support",
        amount: "3000",
        description: "Contractor coordination and installation supervision",
        startDate: "",
        endDate: ""
      }
    ]
  },
  {
    isSelected: true,
    id: "graphic-design",
    title: "Graphic Design",
    description: "Comprehensive graphic design package including branding, marketing materials, and digital assets.",
    contractId: "GD-2024-001",
    vendorEmail: "",
    startDate: "",
    endDate: "",
    paymentType: "fixed",
    totalPayment: "8000",
    contractType: "services",
    milestones: [
      {
        name: "Brand Identity",
        amount: "2500",
        description: "Logo design, color palette, and typography selection",
        startDate: "",
        endDate: ""
      },
      {
        name: "Marketing Materials",
        amount: "2000",
        description: "Business cards, letterheads, and promotional materials",
        startDate: "",
        endDate: ""
      },
      {
        name: "Digital Assets",
        amount: "2000",
        description: "Social media templates and digital marketing materials",
        startDate: "",
        endDate: ""
      },
      {
        name: "Brand Guidelines",
        amount: "1500",
        description: "Comprehensive brand style guide and usage documentation",
        startDate: "",
        endDate: ""
      }
    ]
  },
  {
    isSelected: true,
    id: "home-renovation",
    title: "Home Renovation",
    description: "Complete home renovation services including structural updates, interior finishing, and project management.",
    contractId: "HR-2024-001",
    vendorEmail: "",
    startDate: "",
    endDate: "",
    paymentType: "fixed",
    totalPayment: "75000",
    contractType: "services",
    milestones: [
      {
        name: "Planning and Design",
        amount: "15000",
        description: "Architectural plans, permits, and project scheduling",
        startDate: "",
        endDate: ""
      },
      {
        name: "Structural Work",
        amount: "25000",
        description: "Foundation repairs, wall modifications, and major installations",
        startDate: "",
        endDate: ""
      },
      {
        name: "Interior Finishing",
        amount: "20000",
        description: "Flooring, painting, cabinetry, and fixture installation",
        startDate: "",
        endDate: ""
      },
      {
        name: "Final Touches",
        amount: "15000",
        description: "Finishing details, cleanup, and final inspection",
        startDate: "",
        endDate: ""
      }
    ]
  },
  {
    isSelected: true,
    id: "it-support",
    title: "IT Support",
    description: "Comprehensive IT support services including system maintenance, security, and technical assistance.",
    contractId: "IT-2024-001",
    vendorEmail: "",
    startDate: "",
    endDate: "",
    paymentType: "fixed",
    totalPayment: "24000",
    milestones: [
      {
        name: "System Assessment",
        amount: "6000",
        description: "Infrastructure evaluation and needs analysis",
        startDate: "",
        endDate: ""
      },
      {
        name: "Security Implementation",
        amount: "7000",
        description: "Security protocols setup and cybersecurity measures",
        startDate: "",
        endDate: ""
      },
      {
        name: "System Optimization",
        amount: "6000",
        description: "Performance tuning and system upgrades",
        startDate: "",
        endDate: ""
      },
      {
        name: "Training and Documentation",
        amount: "5000",
        description: "Staff training and system documentation",
        startDate: "",
        endDate: ""
      }
    ]
  },
  {
    isSelected: true,
    id: "website-development",
    title: "Website Development",
    description: "Custom website development including design, development, testing, and deployment.",
    contractId: "WD-2024-001",
    vendorEmail: "",
    startDate: "",
    endDate: "",
    paymentType: "fixed",
    totalPayment: "20000",
    milestones: [
      {
        name: "Planning and Design",
        amount: "5000",
        description: "Website planning, wireframes, and design mockups",
        startDate: "",
        endDate: ""
      },
      {
        name: "Frontend Development",
        amount: "6000",
        description: "UI implementation and responsive design",
        startDate: "",
        endDate: ""
      },
      {
        name: "Backend Development",
        amount: "6000",
        description: "Server-side functionality and database integration",
        startDate: "",
        endDate: ""
      },
      {
        name: "Testing and Launch",
        amount: "3000",
        description: "Quality assurance, testing, and website deployment",
        startDate: "",
        endDate: ""
      }
    ]
  },
  {
    isSelected: true,
    id: "product-delivery",
    title: "Product Delivery",
    description: "End-to-end product delivery service including warehousing, logistics, and distribution.",
    contractId: "PD-2024-001",
    vendorEmail: "",
    startDate: "",
    endDate: "",
    paymentType: "fixed",
    totalPayment: "30000",
    contractType: "products",
    milestones: [
      {
        name: "Logistics Planning",
        amount: "7500",
        description: "Route optimization and delivery schedule planning",
        startDate: "",
        endDate: ""
      },
      {
        name: "Warehouse Setup",
        amount: "10000",
        description: "Inventory management system and warehouse organization",
        startDate: "",
        endDate: ""
      },
      {
        name: "Fleet Management",
        amount: "7500",
        description: "Vehicle maintenance and tracking system implementation",
        startDate: "",
        endDate: ""
      },
      {
        name: "Operations Launch",
        amount: "5000",
        description: "Staff training and initial operations setup",
        startDate: "",
        endDate: ""
      }
    ]
  }
];

const PreBuildContracts = () => {
  const handleTemplateClick = (template: any) => {
    // Store the template data in sessionStorage
    sessionStorage.setItem('contractFormData', JSON.stringify(template));
  };

  return (
    <>
      <Topbar
        title="Pre-Build Contracts"
        description="Add the following details in order to create your contract"
      />
      <div className="mt-[85px]">
        <div className="w-full">
          <div className="mb-8 border-b border-[#D0D0D0] dark:border-dark-border pb-4">
            <h1 className="text-[22px] lg:text-[24px] font-bold mb-2 text-[#292929] dark:text-dark-text">
              Choose Contract Template
            </h1>
          </div>

          <div className="space-y-6 flex flex-col">
            {contractTemplates.map((template) => (
              <Link 
                key={template.id} 
                href="/pre-built-details"
                onClick={() => handleTemplateClick(template)}
              >
                <div className="group bg-[#F8F8F8] hover:bg-[#F3F4F6] dark:bg-dark-input-bg dark:hover:bg-dark-2/20 rounded-xl p-4 cursor-pointer transition-colors">
                  <Image
                    src={"/assets/download2.svg"}
                    alt="upload"
                    width={24}
                    height={24}
                    className="mb-2"
                  />
                  <h3 className="text-[24px] font-[600] text-[#292929] dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-[16px] font-[400] text-[#64748B] dark:text-dark-text/60">
                    {template.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PreBuildContracts;
