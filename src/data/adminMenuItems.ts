import {
  BarChart3,
  ChevronDown,
  FileText,
  Home,
  Users,
  UserPlus,
  Download,
  ArrowRightLeft,
  Eye,
  Blocks,
  Trash,
  Unlink,
  FileBox,
  ListMinus,
  ClipboardList,
  UserX,
  Boxes
} from "lucide-react"

export const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    color: "bg-blue-500",
  },
  {
    title: "Lead Management",
    icon: Boxes,
    color: "bg-green-500",
    items: [
      
      {
        title: "Lead Report",
        url: "/lead-management/report",
        icon: FileText,
      },
      {
        title: "Import Lead",
        url: "/lead-management/import",
        icon: Download,
      },
      {
        title: "Transfer Leads",
        url: "/lead-management/transfer",
        icon: ArrowRightLeft,
      },
      {
        title: "Deleted Leads",
        url: "/lead-management/deleted",
        icon: Trash,
      },
      {
        title: "Unassigned Leads",
        url: "/lead-management/unassigned",
        icon: Unlink,
      },
    ],
  },
  {
    title: "Staff Management",
    icon: UserPlus,
    color: "bg-yellow-500",
    items: [
      {
        title: "View Staff",
        url: "/staff-management/view",
        icon: Eye,
      },
      {
        title: "Registrations",
        url: "/staff-management/registrations",
        icon: FileText,
      },
      {
        title: "Designations",
        url: "/admin/designations",
        icon: Eye,
      },
    ],
  },
  
  {
    title: "Employee",
    icon: Users,
    color: "bg-indigo-500",
    items: [
      {
        title: "View Employees",
        url: "/admin/employees",
        icon: Eye,
      },
      {
        title: "Registrations",
        url: "/admin/employees/registrations",
        icon: FileText,
      },
    ],
  },
  {
    title: "Event Management",
    icon: FileBox,
    color: "bg-purple-500",
    items: [
      {
        title: "Event List",
        url: "/event-management/list",
        icon: Eye,
      },
      {
        title: "Event Data",
        url: "/event-management/data",
        icon: ListMinus,
      },
    ],
  },
  ,
  {
    title: 'Branch',
    icon: Blocks,
    color: "bg-blue-500",
    items: [
      {
        title: "View Branch",
        url: "/branch-management/view",
        icon: Eye,
      },
    ]
    },
  {
    title: "Reports",
    icon: BarChart3,
    color: "bg-orange-500",
    items: [
      {
        title: "Staff Report",
        url: "/staff-management/view",
        icon: Users,
      },
      {
        title: "Transfer Lead Report",
        url: "/reports/transfer-lead",
        icon: ArrowRightLeft,
      },
      {
        title: "Total Lead Report",
        url: "/lead-management/report",
        icon: FileText,
      },
    ],
  },
  
    {
    title: "HR Actions",
    icon: ClipboardList,
    color: "bg-red-500",
    items: [
      {
        title: "Resignations",
        url: "/admin/resignations",
        icon: ClipboardList,
      },
      {
        title: "Terminations",
        url: "/admin/terminations",
        icon: UserX,
      },
        {
          title: "Attendance",
          icon: ClipboardList,
          items: [
            {
              title: "Request",
              url: "/admin/attendance/request",
              icon: FileText,
            },
            {
              title: "Attendance",
              url: "/admin/attendance/view",
              icon: Eye,
            },
          ],
        },
    ],
  },
    
]