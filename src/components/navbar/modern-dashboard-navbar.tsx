"use client"

import type * as React from "react"
import { ChevronDown, Search, Bell, User, Menu, X, Settings, Phone, MessageSquare, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { menuItems } from "@/data/adminMenuItems"
import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { getFollowupData } from "@/service/followupService"

interface LeadData {
  id:string
  name: string
  phoneNumber: string
  createdDate: string
  status: number
  assignedAgentName: string
  leadId: string
}

interface LeadReminderNotification {
  id: string
  leadData: LeadData
  reminderType: "followup" | "callback" | "meeting"
  reminderDate: string
  message: string
}

interface LeadStatusNotification {
  id: string
  leadData: LeadData
  statusChange: string
  previousStatus: number
  newStatus: number
}

interface MessageNotification {
  id: string
  title: string
  message: string
  time: string
  sender: string
  avatar: string
}

interface CalendarNotification {
  id: string
  title: string
  eventDate: string
  eventType: string
  description: string
}



const sampleLeadStatus: LeadStatusNotification[] = [
  {
    id: "ls1",
    leadData: {
      id:"",
      name: "Nivya",
      phoneNumber: "889473152",
      createdDate: "12/01/2025, 04:37:36 PM",
      status: 1,
      assignedAgentName: "Agent Name",
      leadId: "lead123",
    },
    statusChange: "New lead created",
    previousStatus: 0,
    newStatus: 1,
  },
  {
    id: "ls2",
    leadData: {
      id:"",
      name: "Alfi Reji",
      phoneNumber: "9745186148",
      createdDate: "05/11/2024, 04:34:32 PM",
      status: 2,
      assignedAgentName: "Study Abroad Team",
      leadId: "lead456",
    },
    statusChange: "Status updated to Confirmed",
    previousStatus: 1,
    newStatus: 2,
  },
]

const sampleMessages: MessageNotification[] = [
  {
    id: "m1",
    title: "New Message",
    message: "You have a new message from client",
    time: "2025-01-12 15:30:00",
    sender: "Client Portal",
    avatar: "C",
  },
]

const sampleCalendar: CalendarNotification[] = [
  {
    id: "c1",
    title: "Meeting Scheduled",
    eventDate: "2025-01-13 10:00:00",
    eventType: "Client Meeting",
    description: "Meeting with potential client",
  },
]

function ModernSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const [followupNotifications, setFollowupNotifications] = useState<LeadReminderNotification[]>([])

  

  

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <div
        className={`
  fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
  transform transition-transform duration-300 ease-in-out z-50 flex flex-col
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0 lg:relative lg:z-auto
`}
      >
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
  const { user } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const [selectedLeadReminders, setSelectedLeadReminders] = useState<string[]>([])
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<string[]>([])
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [selectedCalendar, setSelectedCalendar] = useState<string[]>([])

  const [leadReminders, setLeadReminders] = useState<LeadReminderNotification[]>([])
  const [leadStatusNotifications, setLeadStatusNotifications] = useState<LeadStatusNotification[]>([])
  const [messageNotifications, setMessageNotifications] = useState<MessageNotification[]>([])
  const [calendarNotifications, setCalendarNotifications] = useState<CalendarNotification[]>([])

  const [activeTab, setActiveTab] = useState<"lead-reminder" | "lead-status" | "message" | "calendar">("lead-reminder")

  const getNotification = async () => {
    try {
      const response = await getFollowupData()
      console.log("getNotification", response)
      const transformedData = response.data.map((lead: LeadData, index: number) => ({
        id: lead.leadId,
        leadData: lead,
        reminderType: "followup" as const,
        reminderDate: lead.createdDate,
        message: `Follow up with ${lead.assignedAgentName}`,
      }))
      setLeadReminders(transformedData)
    } catch (error) {
      console.error("Error fetching follow-up notifications:", error)
    }
  }

  useEffect(() => {
    getNotification()
  }, [])

  useEffect(() => {
    console.log("user data", user)
  }, [user])

  const logoutUser = () => {
    dispatch({ type: "user/clearUser" })
    localStorage.clear()
    document.cookie = ""
    toast.success("Logged out")
    router.push("/login")
  }

  const handleLeadReminderSelect = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadReminders((prev) => [...prev, notificationId])
    } else {
      setSelectedLeadReminders((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const handleLeadStatusSelect = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadStatus((prev) => [...prev, notificationId])
    } else {
      setSelectedLeadStatus((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const handleMessageSelect = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages((prev) => [...prev, notificationId])
    } else {
      setSelectedMessages((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const handleCalendarSelect = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedCalendar((prev) => [...prev, notificationId])
    } else {
      setSelectedCalendar((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const handleRemoveSelectedLeadReminders = () => {
    setLeadReminders((prev) => prev.filter((notification) => !selectedLeadReminders.includes(notification.id)))
    setSelectedLeadReminders([])
    toast.success(`Removed ${selectedLeadReminders.length} lead reminder(s)`)
  }

  const handleRemoveSelectedLeadStatus = () => {
    setLeadStatusNotifications((prev) => prev.filter((notification) => !selectedLeadStatus.includes(notification.id)))
    setSelectedLeadStatus([])
    toast.success(`Removed ${selectedLeadStatus.length} lead status notification(s)`)
  }

  const handleRemoveSelectedMessages = () => {
    setMessageNotifications((prev) => prev.filter((notification) => !selectedMessages.includes(notification.id)))
    setSelectedMessages([])
    toast.success(`Removed ${selectedMessages.length} message(s)`)
  }

  const handleRemoveSelectedCalendar = () => {
    setCalendarNotifications((prev) => prev.filter((notification) => !selectedCalendar.includes(notification.id)))
    setSelectedCalendar([])
    toast.success(`Removed ${selectedCalendar.length} calendar notification(s)`)
  }

  const getCurrentNotifications = () => {
    switch (activeTab) {
      case "lead-reminder":
        return leadReminders
      case "lead-status":
        return leadStatusNotifications
      case "message":
        return messageNotifications
      case "calendar":
        return calendarNotifications
      default:
        return []
    }
  }

  const getCurrentSelected = () => {
    switch (activeTab) {
      case "lead-reminder":
        return selectedLeadReminders
      case "lead-status":
        return selectedLeadStatus
      case "message":
        return selectedMessages
      case "calendar":
        return selectedCalendar
      default:
        return []
    }
  }

  const getCurrentHandler = () => {
    switch (activeTab) {
      case "lead-reminder":
        return handleLeadReminderSelect
      case "lead-status":
        return handleLeadStatusSelect
      case "message":
        return handleMessageSelect
      case "calendar":
        return handleCalendarSelect
      default:
        return () => {}
    }
  }

  const getCurrentRemoveHandler = () => {
    switch (activeTab) {
      case "lead-reminder":
        return handleRemoveSelectedLeadReminders
      case "lead-status":
        return handleRemoveSelectedLeadStatus
      case "message":
        return handleRemoveSelectedMessages
      case "calendar":
        return handleRemoveSelectedCalendar
      default:
        return () => {}
    }
  }

  const getTotalNotificationCount = () => {
    return (
      leadReminders.length + leadStatusNotifications.length + messageNotifications.length + calendarNotifications.length
    )
  }

  const currentNotifications = getCurrentNotifications()
  const currentSelected = getCurrentSelected()
  const currentHandler = getCurrentHandler()
  const currentRemoveHandler = getCurrentRemoveHandler()

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
                  {getTotalNotificationCount()}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="bg-slate-700 text-white p-4 rounded-t-lg">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => setActiveTab("lead-reminder")}
                    className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                      activeTab === "lead-reminder" ? "bg-slate-600" : "hover:bg-slate-600"
                    }`}
                  >
                    <Phone className="h-4 w-4 mr-1" />({leadReminders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("message")}
                    className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                      activeTab === "message" ? "bg-slate-600" : "hover:bg-slate-600"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />({messageNotifications.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("lead-status")}
                    className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                      activeTab === "lead-status" ? "bg-slate-600" : "hover:bg-slate-600"
                    }`}
                  >
                    <User className="h-4 w-4 mr-1" />({leadStatusNotifications.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                      activeTab === "calendar" ? "bg-slate-600" : "hover:bg-slate-600"
                    }`}
                  >
                    <Calendar className="h-4 w-4 mr-1" />({calendarNotifications.length})
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {currentNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-slate-400" />
                    </div>
                    <h4 className="font-medium text-slate-900 mb-2">
                      {activeTab === "lead-reminder" ? "Your Reminder List is Up-to-Date" : "No Notifications"}
                    </h4>
                    <p className="text-slate-500 text-sm">
                      {activeTab === "lead-reminder"
                        ? "All your reminders have been completed or cleared. Add new ones to stay on track!"
                        : "No notifications in this category"}
                    </p>
                  </div>
                ) : (
                  currentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start p-4 border-b border-slate-100 hover:bg-slate-50"
                    >
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-slate-600 font-medium text-sm">
                          {activeTab === "lead-reminder" || activeTab === "lead-status"
                            ? (notification as LeadReminderNotification | LeadStatusNotification).leadData.name.charAt(
                                0,
                              )
                            : activeTab === "message"
                              ? (notification as MessageNotification).avatar
                              : "C"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {activeTab === "lead-reminder" && (
                              <>
                              {/* come here */}
                              <Link href={`/lead-management/lead/${(notification as LeadReminderNotification).id}`}>
                                <p className="font-medium text-slate-900 text-sm">
                                  {(notification as LeadReminderNotification).leadData.name}
                                </p>
                                <p className="text-slate-600 text-sm mt-1">
                                  {(notification as LeadReminderNotification).leadData.phoneNumber}
                                </p>
                                <p className="text-slate-600 text-sm">
                                  {(notification as LeadReminderNotification).message}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                  Reminder: {(notification as LeadReminderNotification).reminderDate}
                                </p>
                                </Link>
                              </>
                            )}
                            {activeTab === "lead-status" && (
                              <>
                                <p className="font-medium text-slate-900 text-sm">
                                  {(notification as LeadStatusNotification).leadData.name}
                                </p>
                                <p className="text-slate-600 text-sm mt-1">
                                  {(notification as LeadStatusNotification).leadData.phoneNumber}
                                </p>
                                <p className="text-slate-600 text-sm">
                                  Status: {(notification as LeadStatusNotification).leadData.status}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                  {(notification as LeadStatusNotification).leadData.createdDate}
                                </p>
                              </>
                            )}
                            {activeTab === "message" && (
                              <>
                                <p className="font-medium text-slate-900 text-sm">
                                  {(notification as MessageNotification).title}
                                </p>
                                <p className="text-slate-600 text-sm mt-1">
                                  {(notification as MessageNotification).message}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                  {(notification as MessageNotification).time}
                                </p>
                              </>
                            )}
                            {activeTab === "calendar" && (
                              <>
                                <p className="font-medium text-slate-900 text-sm">
                                  {(notification as CalendarNotification).title}
                                </p>
                                <p className="text-slate-600 text-sm mt-1">
                                  {(notification as CalendarNotification).eventType}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                  {(notification as CalendarNotification).eventDate}
                                </p>
                              </>
                            )}
                          </div>
                          <Checkbox
                            checked={currentSelected.includes(notification.id)}
                            onCheckedChange={(checked) => currentHandler(notification.id, checked as boolean)}
                            className="ml-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentSelected.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <Button onClick={currentRemoveHandler} variant="destructive" size="sm" className="w-full">
                    Remove ({currentSelected.length})
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
              <DropdownMenuItem className="text-red-600" onClick={logoutUser}>
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
