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
        description: "During the initial consultation phase, our expert kitchen designers will conduct a comprehensive assessment of your space and requirements. This includes taking detailed measurements of the kitchen area, evaluating existing plumbing and electrical systems, and documenting current pain points and limitations. We'll discuss your cooking habits, storage needs, and aesthetic preferences in depth. Our team will analyze traffic flow patterns, consider ergonomic requirements, and evaluate natural light sources. We'll also review your budget constraints and timeline expectations. This phase includes photographing and documenting the current space, creating preliminary sketches, and discussing potential layout options. We'll explore your style preferences through inspiration images and material samples, and begin to formulate a design direction that aligns with your vision. The consultation will also cover any structural limitations, building codes, or permit requirements that may impact the design.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Design Concept",
        amount: "4000",
        description: "In the design concept phase, we transform the insights gathered during consultation into a comprehensive design solution. Our team will create detailed 3D renderings that bring your new kitchen to life, allowing you to visualize the space from multiple angles. We'll develop several layout options, each optimized for functionality and flow. The material selection process will include extensive research into countertop materials, cabinetry styles, hardware options, lighting fixtures, and appliance specifications. We'll create detailed mood boards showcasing color schemes, texture combinations, and finish selections. The 3D models will include accurate representations of cabinet dimensions, appliance placements, and lighting plans. We'll also provide virtual walkthroughs of the space, allowing you to experience the design before implementation. This phase includes multiple revision rounds to refine the design based on your feedback, ensuring every detail meets your expectations. We'll also begin preliminary discussions with suppliers and contractors to ensure material availability and installation feasibility.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Detailed Planning",
        amount: "5000",
        description: "The detailed planning phase involves creating comprehensive documentation and specifications for your kitchen renovation. Our team will produce detailed construction drawings including floor plans, elevation views, and section details. These technical documents will specify exact measurements for cabinet placements, plumbing locations, electrical outlets, and lighting fixtures. We'll create detailed material schedules listing every component, from cabinet hardware to light switches. The documentation will include specific model numbers, finishes, and quantities for all materials and fixtures. We'll develop a detailed timeline for the renovation process, identifying key milestones and dependencies. This phase also includes creating detailed plumbing and electrical plans, specifying any required modifications to existing systems. We'll prepare detailed cost estimates breaking down material and labor costs for each aspect of the project. The documentation will include installation instructions for complex elements and special considerations for custom features. We'll also prepare permit application documents and coordinate with relevant authorities to ensure compliance with building codes and regulations.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Implementation Support",
        amount: "3000",
        description: "During the implementation support phase, our team provides comprehensive oversight of the kitchen renovation process. We'll assist in contractor selection, reviewing bids and qualifications to ensure the right team is chosen for your project. Our designers will conduct regular site visits to monitor construction progress and ensure adherence to design specifications. We'll coordinate with various trades including plumbers, electricians, cabinetmakers, and countertop fabricators to ensure smooth workflow and proper sequencing of installations. This phase includes quality control inspections at key stages of the project, verifying that materials and workmanship meet our high standards. We'll troubleshoot any unexpected issues that arise during construction, providing creative solutions while maintaining design integrity. Our team will review and approve material samples and mock-ups before final installation. We'll coordinate delivery schedules for all materials and fixtures, ensuring proper storage and handling. The support includes final punch list development and follow-up to ensure all details are properly completed. We'll also provide guidance on kitchen maintenance and care once the installation is complete.",
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
        description: "The brand identity development phase begins with extensive market research and competitor analysis to understand your industry's visual landscape. We'll conduct in-depth interviews with stakeholders to understand your company's values, mission, and target audience. Our team will explore multiple creative directions, developing various logo concepts that capture your brand's essence. The logo design process includes sketching, digital refinement, and presentation of multiple options. We'll carefully select typography that complements your brand personality, considering factors like readability across different mediums and scalability. Color palette development involves psychological analysis of color meanings and testing combinations in various applications. We'll create multiple iterations of each design element, refining based on your feedback. This phase includes extensive testing of the logo and typography in different sizes and applications to ensure versatility. We'll also research and verify trademark availability to ensure your brand identity is unique and protectable.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Marketing Materials",
        amount: "2000",
        description: "In the marketing materials development phase, we'll create a comprehensive suite of business collateral that consistently represents your brand. This includes designing professional business cards with careful consideration of paper stock, printing techniques, and special finishes to create a memorable first impression. Letterhead design will include both digital and print versions, with attention to margin specifications and electronic compatibility. We'll develop envelope designs, compliment slips, and other stationery items that maintain brand consistency. The process includes creating templates for various document types, ensuring easy implementation across your organization. We'll design promotional materials such as brochures, flyers, and presentation folders, each tailored to specific marketing objectives. This phase includes developing guidelines for photography style and image treatment to maintain visual consistency. We'll also create templates for internal documents, ensuring brand consistency extends to all company communications. Each item will be tested in its intended use context to ensure functionality matches design aesthetic.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Digital Assets",
        amount: "2000",
        description: "The digital assets creation phase focuses on developing a comprehensive suite of online marketing materials optimized for various platforms and devices. We'll create social media templates for multiple platforms, including profile images, cover photos, and post templates that maintain brand consistency while meeting each platform's specific requirements. Our team will develop email marketing templates with responsive designs that display properly across different email clients and devices. We'll create banner ad sets in standard sizes for digital advertising campaigns, ensuring consistent messaging and visual appeal. The process includes developing website graphics and icons that enhance user experience while maintaining brand identity. We'll create animated versions of your logo and other brand elements for digital applications. This phase includes developing custom illustrations and infographic templates that can be used across various digital channels. We'll also create video intro/outro sequences and motion graphics templates for multimedia content. Each digital asset will be optimized for various screen sizes and resolutions to ensure quality across all devices.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Brand Guidelines",
        amount: "1500",
        description: "The brand guidelines documentation phase involves creating a comprehensive manual that ensures consistent brand implementation across all channels and applications. We'll develop detailed specifications for logo usage, including minimum sizes, clear space requirements, and approved color variations. The guide will include extensive documentation of typography rules, including primary and secondary typefaces, font weights, and specific usage guidelines for different applications. Color specifications will be provided in all relevant color systems (CMYK, RGB, Pantone, HEX) with guidance on color combinations and usage hierarchy. We'll create detailed examples of correct and incorrect brand usage to prevent common mistakes. The guidelines will include specifications for photography style, image treatment, and illustration guidelines. We'll document grid systems and layout principles for various applications. The guide will include voice and tone guidelines to ensure consistency in written communications. We'll also provide detailed specifications for social media usage, email marketing, and other digital applications. The documentation will include file naming conventions and asset management guidelines.",
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
        description: "The planning and design phase encompasses comprehensive preparation for your home renovation project. Our team will conduct detailed site surveys and structural assessments to understand the existing conditions of your home. We'll create detailed architectural plans including floor plans, elevation drawings, and section details. The process includes extensive consultation with structural engineers to ensure all proposed modifications are feasible and safe. We'll handle all aspects of permit applications, including preparation of required documentation and coordination with local authorities. This phase includes creating detailed 3D renderings of proposed changes to help visualize the final result. We'll develop comprehensive project schedules identifying all major milestones and dependencies. The team will create detailed specifications for all materials and finishes, including samples and mock-ups where necessary. We'll also conduct environmental and safety assessments to identify any potential hazards or concerns. This phase includes development of contingency plans for various scenarios that might arise during construction.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Structural Work",
        amount: "25000",
        description: "The structural work phase involves major construction and modification of your home's fundamental elements. Our team will begin with careful demolition of designated areas, ensuring proper protection of areas to remain untouched. We'll conduct thorough foundation assessments and implement any necessary repairs or reinforcements. The process includes installation of new support beams and columns where required, ensuring proper load distribution throughout the structure. We'll modify existing walls, including removal or addition of load-bearing elements with proper temporary support systems in place. This phase includes installation of new plumbing and electrical systems, requiring careful coordination between different trades. We'll implement any necessary roof modifications or repairs, ensuring proper waterproofing and insulation. The team will install new windows and doors, including any structural modifications required for these openings. We'll also address any discovered issues such as water damage, pest infestation, or outdated materials. This phase includes regular inspections by structural engineers to verify work quality and compliance with building codes.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Interior Finishing",
        amount: "20000",
        description: "The interior finishing phase transforms the structural shell into a refined living space. Our team will begin with installation of drywall and plastering, ensuring smooth and even surfaces throughout. We'll implement comprehensive painting schemes, including proper surface preparation and multiple coats for durability. The process includes installation of all flooring materials, whether hardwood, tile, or other specified materials, with proper subflooring preparation. We'll install custom cabinetry and built-in features, ensuring precise fit and alignment. This phase includes installation of all bathroom and kitchen fixtures, with careful attention to plumbing connections and waterproofing. We'll install all interior doors and trim work, including baseboards, crown molding, and window casings. The team will implement lighting fixtures and electrical outlets, ensuring proper placement and functionality. We'll also install any special features such as built-in shelving, fireplaces, or custom storage solutions. This phase includes detailed finishing work such as caulking, touch-up painting, and hardware installation.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Final Touches",
        amount: "15000",
        description: "The final touches phase ensures every detail of your renovation is perfectly executed and ready for occupancy. Our team will conduct comprehensive quality control inspections of all completed work, creating detailed punch lists for any items requiring attention. We'll perform thorough cleaning of all surfaces, including professional window cleaning and floor polishing. The process includes installation of all finishing hardware such as door handles, cabinet pulls, and bathroom accessories. We'll coordinate final inspections with relevant authorities to obtain occupancy permits. This phase includes testing and calibration of all installed systems including HVAC, electrical, and plumbing. We'll conduct detailed walk-throughs with you to demonstrate operation of new features and systems. The team will complete any necessary touch-up work to ensure perfect finishing. We'll also provide comprehensive documentation including warranties, maintenance instructions, and as-built drawings. This phase includes creating a detailed maintenance schedule and recommendations for long-term care of new installations. We'll also address any final concerns or adjustments needed for your complete satisfaction.",
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
        description: "The system assessment phase involves a comprehensive evaluation of your current IT infrastructure and technological needs. Our team will conduct detailed audits of all hardware components, including servers, workstations, networking equipment, and peripheral devices, documenting specifications and performance metrics. We'll analyze your software ecosystem, including operating systems, applications, licenses, and version control systems. The process includes network infrastructure assessment, examining bandwidth usage, connectivity issues, and network security measures. We'll evaluate data storage systems and backup procedures, including capacity planning and disaster recovery capabilities. This phase includes detailed documentation of user access controls and authentication systems. We'll analyze system logs and performance metrics to identify potential bottlenecks or areas for improvement. The team will assess compliance with industry regulations and security standards. We'll also conduct user interviews to understand pain points and operational needs. This phase includes creating detailed network diagrams and system documentation for future reference.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Security Implementation",
        amount: "7000",
        description: "The security implementation phase focuses on establishing robust cybersecurity measures to protect your IT infrastructure. Our team will implement comprehensive firewall solutions with detailed rule sets and monitoring capabilities. We'll establish advanced endpoint protection systems including antivirus, anti-malware, and intrusion detection systems. The process includes implementing multi-factor authentication across all applicable systems and services. We'll configure virtual private networks (VPNs) for secure remote access capabilities. This phase includes setting up email security systems with spam filtering and phishing protection. We'll implement data encryption protocols for both stored and transmitted data. The team will establish security information and event management (SIEM) systems for real-time threat detection and response. We'll configure backup systems with encryption and off-site storage capabilities. This phase includes implementing access control systems with role-based permissions and audit logging. We'll also conduct security awareness training for staff members to ensure proper protocol adherence.",
        startDate: "",
        endDate: ""
      },
      {
        name: "System Optimization",
        amount: "6000",
        description: "The system optimization phase focuses on enhancing the performance and efficiency of your IT infrastructure. Our team will conduct comprehensive performance tuning of servers and workstations, including operating system optimization and service configuration. We'll implement advanced caching solutions and load balancing systems to improve response times and resource utilization. The process includes database optimization, including query performance tuning and index optimization. We'll implement automated maintenance schedules for regular system cleaning and updates. This phase includes network optimization through traffic prioritization and bandwidth management. We'll configure system monitoring tools to provide real-time performance metrics and alerts. The team will implement automated backup systems with versioning and quick recovery capabilities. We'll optimize storage systems through deduplication and compression technologies. This phase includes implementing automated patch management systems for consistent updates. We'll also establish performance benchmarks and monitoring systems for ongoing optimization.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Training and Documentation",
        amount: "5000",
        description: "The training and documentation phase ensures proper knowledge transfer and system management capabilities. Our team will create comprehensive system documentation including network diagrams, configuration details, and standard operating procedures. We'll develop detailed user manuals for all implemented systems and applications, including step-by-step guides for common tasks. The process includes creating video tutorials and interactive training materials for various skill levels. We'll establish a knowledge base system for troubleshooting common issues and system maintenance procedures. This phase includes conducting hands-on training sessions for system administrators and end users. We'll create documentation for disaster recovery procedures and business continuity plans. The team will develop change management procedures and documentation templates. We'll establish documentation for security protocols and incident response procedures. This phase includes creating maintenance schedules and procedures for all systems. We'll also provide documentation for compliance requirements and audit procedures.",
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
        description: "The planning and design phase establishes the foundation for your website development project. Our team will conduct extensive user research and create detailed user personas to inform the design process. We'll develop comprehensive wireframes for all pages, showing layout structure and content placement. The process includes creating interactive prototypes to test user flows and navigation patterns. We'll design multiple visual concepts, incorporating your brand guidelines and aesthetic preferences. This phase includes developing responsive design specifications for various device sizes. We'll create detailed style guides including typography, color schemes, and component designs. The team will develop animation and interaction specifications for enhanced user experience. We'll also plan technical architecture and database structure. This phase includes content strategy development and information architecture planning. We'll create detailed project timelines and milestone definitions.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Frontend Development",
        amount: "6000",
        description: "The frontend development phase transforms design concepts into interactive web interfaces. Our team will implement responsive layouts using modern HTML5 and CSS3 techniques, ensuring compatibility across different devices and browsers. We'll develop custom components and interactive elements using JavaScript and appropriate frameworks. The process includes implementing advanced animations and transitions for enhanced user engagement. We'll optimize image assets and implement lazy loading for improved performance. This phase includes developing form validation and user input handling. We'll implement accessibility features following WCAG guidelines. The team will create reusable component libraries for consistent styling and functionality. We'll implement state management systems for complex user interactions. This phase includes development of client-side data validation and error handling. We'll also implement performance optimization techniques including code splitting and bundle optimization.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Backend Development",
        amount: "6000",
        description: "The backend development phase focuses on creating robust server-side functionality and data management systems. Our team will implement secure authentication and authorization systems with role-based access control. We'll develop RESTful APIs for efficient data communication between frontend and backend. The process includes implementing database schemas and relationships using appropriate database technologies. We'll develop efficient query optimization and caching strategies for improved performance. This phase includes implementing file upload and management systems with proper security measures. We'll develop email notification systems and other communication features. The team will implement payment gateway integration with proper security protocols. We'll develop automated backup systems and data recovery procedures. This phase includes implementing logging and monitoring systems for tracking system behavior. We'll also develop API documentation and testing procedures.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Testing and Launch",
        amount: "3000",
        description: "The testing and launch phase ensures your website functions flawlessly across all scenarios. Our team will conduct comprehensive functionality testing across different browsers and devices. We'll perform detailed security testing including penetration testing and vulnerability assessments. The process includes load testing to ensure proper performance under various traffic conditions. We'll conduct user acceptance testing with detailed feedback collection and implementation. This phase includes accessibility testing to ensure compliance with WCAG guidelines. We'll perform SEO optimization and implement necessary meta tags and structured data. The team will conduct performance testing and optimization using various tools and metrics. We'll implement analytics tracking and conversion monitoring systems. This phase includes creating deployment procedures and rollback plans. We'll also provide post-launch monitoring and support procedures.",
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
        description: "The logistics planning phase involves comprehensive development of delivery strategies and route optimization. Our team will conduct detailed analysis of delivery zones and create efficient routing algorithms based on historical traffic patterns and geographical constraints. We'll develop delivery schedules that optimize vehicle capacity and minimize fuel consumption. The process includes creating contingency plans for various scenarios including weather conditions and vehicle breakdowns. We'll establish relationships with backup delivery partners for peak periods. This phase includes developing tracking systems for real-time delivery monitoring. We'll create detailed procedures for handling different types of products including temperature-sensitive items. The team will establish quality control checkpoints throughout the delivery process. We'll develop performance metrics and reporting systems for delivery efficiency. This phase includes creating emergency response procedures for various scenarios. We'll also establish communication protocols between drivers, dispatch, and customers.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Warehouse Setup",
        amount: "10000",
        description: "The warehouse setup phase focuses on creating an efficient and organized storage and distribution center. Our team will design optimal layout plans maximizing space utilization and workflow efficiency. We'll implement inventory management systems with barcode scanning and RFID tracking capabilities. The process includes setting up storage zones based on product categories and handling requirements. We'll establish quality control stations and inspection areas throughout the warehouse. This phase includes implementing temperature control systems for sensitive products. We'll set up packing stations with appropriate equipment and supplies. The team will implement safety measures including proper lighting, ventilation, and emergency exits. We'll establish cleaning and maintenance schedules for all equipment and areas. This phase includes creating detailed procedures for receiving, storing, and shipping products. We'll also implement security systems including cameras and access control.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Fleet Management",
        amount: "7500",
        description: "The fleet management phase involves establishing comprehensive vehicle maintenance and tracking systems. Our team will implement GPS tracking systems in all delivery vehicles for real-time location monitoring. We'll develop preventive maintenance schedules for each vehicle type. The process includes establishing relationships with maintenance providers and parts suppliers. We'll implement fuel management systems to monitor and optimize consumption. This phase includes creating driver training programs for vehicle operation and maintenance. We'll establish vehicle inspection procedures for daily pre-trip and post-trip checks. The team will implement electronic logging devices for driver hours and vehicle usage. We'll develop procedures for vehicle cleaning and sanitization. This phase includes creating emergency response procedures for vehicle breakdowns. We'll also establish performance metrics for vehicle efficiency and driver behavior.",
        startDate: "",
        endDate: ""
      },
      {
        name: "Operations Launch",
        amount: "5000",
        description: "The operations launch phase ensures smooth integration of all delivery system components. Our team will conduct comprehensive staff training on all operational procedures and systems. We'll perform test runs of delivery routes with various scenarios and conditions. The process includes establishing communication protocols between all operational units. We'll implement customer service procedures for handling inquiries and issues. This phase includes creating detailed documentation for all operational procedures. We'll establish quality control measures for the entire delivery process. The team will implement performance monitoring systems for all operational aspects. We'll conduct stress tests of systems under various load conditions. This phase includes establishing reporting procedures for daily operations. We'll also create continuous improvement processes for ongoing optimization.",
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
