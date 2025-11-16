"use client"

import type * as React from "react"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  Search,
  Users,
  UserPlus,
  Bell,
  User,
  Menu,
  X,
  Settings,
  Phone,
  Download,
  ClipboardList,
  Power
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox" // Added Checkbox import
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { deleteFollowup, getFollowupData } from "@/service/followupService" // Added service imports

interface LeadData {
  id: string
  name: string
  phoneNumber: string
  createdDate: string
  status: number
  assignedAgentName: string
  leadId: string
}

interface LeadReminderNotification {
  followupId: string
  id: string
  leadData: LeadData
  reminderType: "followup" | "callback" | "meeting"
  reminderDate: string
  message: string
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/staff/dashboard",
    icon: Home,
    color: "bg-blue-500",
  },
  {
    title: "Attendance",
    url: "/staff/attendance",
    icon: Calendar,
    color: "bg-purple-500",
  },
  {
    title: "Applications",
    icon: ClipboardList,
    color: "bg-red-500",
    items: [
      {
        title: "Resignation",
        url: "/staff/application/resignation",
        icon: FileText,
      },
    ],
  },
  {
    title: "Lead Management",
    icon: Users,
    color: "bg-green-500",
    items: [
      {
        title: "Lead Report",
        url: "/staff/report",
        icon: FileText,
      },
      {
        title: "import lead",
        url: "/staff/import",
        icon: Download,
      },
    ],
  },
  {
    title: "Events",
    icon: Users,
    color: "bg-orange-500",
    items: [
      {
        title: "Assigned Events",
        url: "/staff/event-management",
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
  const { user } = useSelector((state: RootState) => state.user)
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
                <h1 className="text-white font-semibold text-lg">{user?.name || "Mark International"}</h1>
                <p className="text-slate-400 text-sm">{user?.designation || "Education Company"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
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

        
      </div>
    </>
  )
}

function ModernHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const [selectedLeadReminders, setSelectedLeadReminders] = useState<string[]>([])
  const [leadReminders, setLeadReminders] = useState<LeadReminderNotification[]>([])

  const getNotification = async () => {
    try {
      const response = await getFollowupData()
      console.log("getNotification", response)
      const transformedData = response.data.map((lead: LeadData, index: number) => ({
        followupId: lead.id,
        id: lead.leadId,
        leadData: lead,
        reminderType: "followup" as const,
        reminderDate: lead.createdDate,
        message: `Follow up By ${lead.assignedAgentName}`,
      }))
      setLeadReminders(transformedData)
    } catch (error) {
      console.error("Error fetching follow-up notifications:", error)
    }
  }

  const handleLeadReminderSelect = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadReminders((prev) => [...prev, notificationId])
    } else {
      setSelectedLeadReminders((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const handleRemoveSelectedLeadReminders = async () => {
    console.log("selectedLeadReminders", selectedLeadReminders)
    try {
      const response = await deleteFollowup(selectedLeadReminders)
      getNotification()
    } catch (err) {
      console.error("Error deleting follow-up notifications")
    }
    setLeadReminders((prev) => prev.filter((notification) => !selectedLeadReminders.includes(notification.id)))
    setSelectedLeadReminders([])
    toast.success(`Removed ${selectedLeadReminders.length} lead reminder(s)`)
  }

  useEffect(() => {
    console.log("user data", user)
  }, [user])

  useEffect(() => {
    getNotification()
  }, [])

  const logoutUser = () => {
    dispatch({ type: "user/clearUser" })
    localStorage.clear()
    document.cookie = ""
    toast.success("Logged out")
    router.push("/login")
  }

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {leadReminders.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="bg-slate-700 text-white p-4 rounded-t-lg">
                <h3 className="font-semibold text-lg">Lead Reminders</h3>
                <div className="flex items-center mt-2">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">({leadReminders.length}) pending</span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {leadReminders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-slate-400" />
                    </div>
                    <h4 className="font-medium text-slate-900 mb-2">Your Reminder List is Up-to-Date</h4>
                    <p className="text-slate-500 text-sm">
                      All your reminders have been completed or cleared. Add new ones to stay on track!
                    </p>
                  </div>
                ) : (
                  leadReminders.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start p-4 border-b border-slate-100 hover:bg-slate-50"
                    >
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-slate-600 font-medium text-sm">
                          {notification.leadData.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link href={`/lead-management/lead/${notification.id}`}>
                              <p className="font-medium text-slate-900 text-sm">{notification.leadData.name}</p>
                              <p className="text-slate-600 text-sm mt-1">{notification.leadData.phoneNumber}</p>
                              <p className="text-slate-600 text-sm">{notification.message}</p>
                              <p className="text-slate-400 text-xs mt-1">Reminder: {notification.reminderDate}</p>
                            </Link>
                          </div>
                          <Checkbox
                            checked={selectedLeadReminders.includes(notification.followupId)}
                            onCheckedChange={(checked) =>
                              handleLeadReminderSelect(notification.followupId, checked as boolean)
                            }
                            className="ml-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedLeadReminders.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <Button
                    onClick={handleRemoveSelectedLeadReminders}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Remove ({selectedLeadReminders.length})
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-slate-50">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900"> {user?.name || "Mark International"} </p>
                  <p className="text-xs text-slate-500">{user?.designation || "Staff"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
             
              
              <DropdownMenuItem className="text-red-600" onClick={logoutUser}>
                <Power className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
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

export default function Component() {
  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-blue-100">Here's what's happening with your education platform today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">1,234</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-600 text-sm font-medium">+20.1%</span>
              <span className="text-slate-500 text-sm ml-2">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Staff</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">45</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-600 text-sm font-medium">+2</span>
              <span className="text-slate-500 text-sm ml-2">new this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">89%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-600 text-sm font-medium">+5%</span>
              <span className="text-slate-500 text-sm ml-2">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Reports Generated</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">156</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-600 text-sm font-medium">+12</span>
              <span className="text-slate-500 text-sm ml-2">this week</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium">New lead imported</p>
                <p className="text-slate-500 text-sm">John Doe added to lead management</p>
              </div>
              <span className="text-slate-400 text-sm">2 min ago</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium">Report generated</p>
                <p className="text-slate-500 text-sm">Monthly staff performance report</p>
              </div>
              <span className="text-slate-400 text-sm">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
