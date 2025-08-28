import {
  BarChart3,
  ChevronDown,
  FileText,
  Home,
  Search,
  Users,
  UserPlus,
  Download,
  ArrowRightLeft,
  Eye,
  Award,
  Bell,
  User,
  Menu,
  X,
  Settings,
  Trash,
  Unlink,
  FileBox,
  ListMinus
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
    icon: Users,
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
      // {
      //   title: "Designation",
      //   url: "/staff-management/designation",
      //   icon: Award,
      // },
    ],
  }, {
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
]