interface Transaction {
  id: string;
  milestoneName: string;
  date: string;
  vendorName: string;
  status: "pending" | "cancelled" | "delivered";
  amount: string;
}

export const transactions: Transaction[] = [
  {
    id: "#ESC11232",
    milestoneName: "House Renovation",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "pending",
    amount: "$200.00",
  },
  {
    id: "#ESC11232",
    milestoneName: "House Renovation",
    date: "Aug 25,2023",
    vendorName: "Stefan",
    status: "cancelled",
    amount: "$400.00",
  },
  {
    id: "#ESC11232",
    milestoneName: "House Renovation",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "delivered",
    amount: "$400.00",
  },
  {
    id: "#ESC11232",
    milestoneName: "House Renovation",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "pending",
    amount: "$200.00",
  },
  {
    id: "#ESC11233",
    milestoneName: "Website Design",
    date: "Sep 15,2023",
    vendorName: "Michael",
    status: "delivered",
    amount: "$800.00",
  },
  {
    id: "#ESC11234",
    milestoneName: "Mobile App Development",
    date: "Oct 3,2023",
    vendorName: "Sarah",
    status: "pending",
    amount: "$1200.00",
  },
  {
    id: "#ESC11235",
    milestoneName: "Logo Design",
    date: "Nov 12,2023",
    vendorName: "David",
    status: "cancelled",
    amount: "$300.00",
  },
  {
    id: "#ESC11236",
    milestoneName: "SEO Optimization",
    date: "Dec 5,2023",
    vendorName: "Emma",
    status: "delivered",
    amount: "$500.00",
  },
  {
    id: "#ESC11237",
    milestoneName: "Content Writing",
    date: "Jan 8,2024",
    vendorName: "James",
    status: "pending",
    amount: "$250.00",
  },
  {
    id: "#ESC11238",
    milestoneName: "Digital Marketing",
    date: "Feb 14,2024",
    vendorName: "Sophie",
    status: "delivered",
    amount: "$900.00",
  },
  {
    id: "#ESC11239",
    milestoneName: "UI/UX Design",
    date: "Mar 1,2024",
    vendorName: "Oliver",
    status: "pending",
    amount: "$700.00",
  },
  {
    id: "#ESC11240",
    milestoneName: "Database Design",
    date: "Mar 20,2024",
    vendorName: "Lucas",
    status: "cancelled",
    amount: "$600.00",
  },
  {
    id: "#ESC11241",
    milestoneName: "Network Setup",
    date: "Apr 5,2024",
    vendorName: "Emily",
    status: "delivered",
    amount: "$1500.00",
  },
  {
    id: "#ESC11242",
    milestoneName: "Security Audit",
    date: "Apr 25,2024",
    vendorName: "William",
    status: "pending",
    amount: "$1100.00",
  },
  {
    id: "#ESC11243",
    milestoneName: "Cloud Migration",
    date: "May 10,2024",
    vendorName: "Charlotte",
    status: "delivered",
    amount: "$2000.00",
  },
];

export const disputeData = [
  {
    id: "#DSP 11232",
    milestoneName: "House Renovation",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "cancelled" as const,
    amount: "Default Job",
  },
  {
    id: "#DSP 11241",
    milestoneName: "Floor Planning",
    date: "Aug 29,2023",
    vendorName: "Stefan",
    status: "pending" as const,
    amount: "Default Job",
  },
  {
    id: "#DSP 11245",
    milestoneName: "Wall Painting",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "in-progress" as const,
    amount: "Default Job",
  },
  {
    id: "#DSP 11241",
    milestoneName: "Floor Planning",
    date: "Aug 29,2023",
    vendorName: "Stefan",
    status: "pending" as const,
    amount: "Default Job",
  },
  {
    id: "#DSP 11245",
    milestoneName: "Wall Painting",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "delivered" as const,
    amount: "Default Job",
  },
  {
    id: "#DSP 11245",
    milestoneName: "Wall Painting",
    date: "Jul 26,2023",
    vendorName: "Jennifer",
    status: "delivered" as const,
    amount: "Default Job",
  },
];

interface Milestone {
  name: string;
  status: "completed" | "in-delay" | "at-risk" | "completed";
  amount: string;
  progress: number;
  deadline: string;
}

export const milestoneData: Milestone[] = [
  {
    name: "Graphics designing, detail",
    status: "completed",
    amount: "$19,823.00",
    progress: 100,
    deadline: "Mar 23, 2022, 10:00 PM",
  },
  {
    name: "Web development, detail",
    status: "in-delay",
    amount: "$8,823.00",
    progress: 65,
    deadline: "Mar 23, 2022, 10:00 PM",
  },
  {
    name: "00-1774-7755-4804, detail",
    status: "at-risk",
    amount: "$1,823.53",
    progress: 25,
    deadline: "Mar 23, 2022, 10:00 PM",
  },
  {
    name: "00-1774-7755-4804, detail",
    status: "completed",
    amount: "$56,823.00",
    progress: 100,
    deadline: "Mar 23, 2022, 10:00 PM",
  },
  {
    name: "00-1774-7755-4804, detail",
    status: "in-delay",
    amount: "$150.00",
    progress: 45,
    deadline: "Mar 23, 2022, 10:00 PM",
  },
  {
    name: "00-1774-7755-4804, detail",
    status: "in-delay",
    amount: "$150.00",
    progress: 45,
    deadline: "Mar 23, 2022, 10:00 PM",
  },
];
