"use client"

import type * as React from "react"
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
  Unlink 
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const menuItems = [
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
        title: "Import Lead",
        url: "/lead-management/import",
        icon: Download,
      },
      {
        title: "Lead Report",
        url: "/lead-management/report",
        icon: FileText,
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
    color: "bg-purple-500",
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
]

function ModernSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
  fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
  transform transition-transform duration-300 ease-in-out z-50 flex flex-col
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 lg:relative lg:z-auto
`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">Mark International</h1>
                <p className="text-slate-400 text-sm">Education Company</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation - Takes available space */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.items ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${expandedItems.includes(item.title) ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expandedItems.includes(item.title) && (
                    <div className="ml-11 mt-2 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.url}
                          className="flex items-center space-x-3 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all duration-200"
                          onClick={onClose}
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span className="text-sm">{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.url}
                  className="flex items-center space-x-3 p-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 group"
                  onClick={onClose}
                >
                  <div
                    className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section - Fixed at bottom */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <Link
            href="/settings"
            className="block bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Settings</p>
                <p className="text-slate-400 text-xs">Manage your account</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}

function ModernHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="pl-10 w-full md:w-80 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-slate-50">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900">Mark International</p>
                  <p className="text-xs text-slate-500">Company Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" >Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export function ModernDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <ModernSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <ModernHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

// export default function Component() {
//   return (
//     <ModernDashboardLayout>
//       <div className="space-y-6">
//         {/* Page Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
//           <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
//           <p className="text-blue-100">Here's what's happening with your education platform today.</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-600 text-sm font-medium">Total Leads</p>
//                 <p className="text-2xl font-bold text-slate-900 mt-1">1,234</p>
//               </div>
//               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                 <Users className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-green-600 text-sm font-medium">+20.1%</span>
//               <span className="text-slate-500 text-sm ml-2">from last month</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-600 text-sm font-medium">Active Staff</p>
//                 <p className="text-2xl font-bold text-slate-900 mt-1">45</p>
//               </div>
//               <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
//                 <UserPlus className="h-6 w-6 text-purple-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-green-600 text-sm font-medium">+2</span>
//               <span className="text-slate-500 text-sm ml-2">new this week</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-600 text-sm font-medium">Conversion Rate</p>
//                 <p className="text-2xl font-bold text-slate-900 mt-1">89%</p>
//               </div>
//               <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
//                 <BarChart3 className="h-6 w-6 text-orange-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-green-600 text-sm font-medium">+5%</span>
//               <span className="text-slate-500 text-sm ml-2">from last month</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-600 text-sm font-medium">Reports Generated</p>
//                 <p className="text-2xl font-bold text-slate-900 mt-1">156</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                 <FileText className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <span className="text-green-600 text-sm font-medium">+12</span>
//               <span className="text-slate-500 text-sm ml-2">this week</span>
//             </div>
//           </div>
//         </div>

//         {/* Content Area */}
//         <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
//           <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
//           <div className="space-y-4">
//             <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                 <UserPlus className="h-5 w-5 text-green-600" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-slate-900 font-medium">New lead imported</p>
//                 <p className="text-slate-500 text-sm">John Doe added to lead management</p>
//               </div>
//               <span className="text-slate-400 text-sm">2 min ago</span>
//             </div>

//             <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
//               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                 <FileText className="h-5 w-5 text-blue-600" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-slate-900 font-medium">Report generated</p>
//                 <p className="text-slate-500 text-sm">Monthly staff performance report</p>
//               </div>
//               <span className="text-slate-400 text-sm">1 hour ago</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ModernDashboardLayout>
//   )
// }
