"use client"

import {
  Calendar,
  Plus,
  TrendingUp,
  Users,
  Phone,
  UserX,
  ArrowRightLeft,
  CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useEffect, useState } from "react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { bottomStatsStyles, categoryColors, staffColors, statsStyles } from "@/data/dashboard-style-data"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { getStaffWiseReport, leadDashboardData, monthlyWiseCount } from "@/service/admin/dashboardService"
import { DashboardLeadType, StaffLeadData } from "@/types/dashboard-type"
import AddLeadsModal from "@/components/admin/add-leads-modal"

export default function HomePage() {
  const [leadData, setLeadData] = useState<DashboardLeadType>({
    totalLeads: 0,
    new: 0,
    followUp: 0,
    closed: 0,
    missed: 0,
    transferred: 0,
  })

  const [staffData, setStaffData] = useState<StaffLeadData[]>([])

  const getLeadData = async () => {
    try {
      const response = await leadDashboardData(leadDateRange?.from || new Date(), leadDateRange?.to || new Date())
      if (response.status) setLeadData(response.data) 
    } catch (error) {
      console.log("error fetching data", error)
    }
  }

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const [categoryDateRange, setCategoryDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 0, 31),
  })

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [staffDateRange, setStaffDateRange] = useState<DateRange | undefined>({
    from: startOfMonth,
    to: today,
  })
  const [leadDateRange, setLeadDateRange] = useState<DateRange | undefined>({
    from: startOfMonth,
    to: today,
  })

  const getStaffReport = async () => {
    try {
      const response = await getStaffWiseReport(staffDateRange?.from || new Date(), staffDateRange?.to || new Date())
      setStaffData(response?.data?.staffData)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getStaffReport()
  }, [staffDateRange])

  useEffect(() => {
    getLeadData()
  }, [categoryDateRange, leadDateRange])

  // compute totals for staff report
  const totals = staffData.reduce(
    (acc, staff) => {
      acc["new lead"] += staff.data["new lead"]
      acc["pending lead"] += staff.data["pending lead"]
      acc["followup lead"] += staff.data["followup lead"]
      acc["rejected lead"] += staff.data["rejected lead"]
      acc["closed lead"] += staff.data["closed lead"]
      return acc
    },
    {
      "new lead": 0,
      "pending lead": 0,
      "followup lead": 0,
      "rejected lead": 0,
      "closed lead": 0,
    }
  )

  // Main Stats
  const statsData = [
    { title: "NEW LEADS", value: leadData.new?.toString() || "0", icon: Users },
    { title: "FOLLOWUP LEADS", value: leadData.followUp?.toString() || "0", icon: TrendingUp },
    { title: "CLOSED LEADS", value: leadData.closed?.toString() || "0", icon: TrendingUp },
    { title: "TOTAL CALLED", value: "0", icon: Phone },
  ]

  const bottomStatsData = [
    { title: "MISSED LEADS", value: leadData.missed?.toString() || "0", icon: UserX },
    { title: "TRANSFERRED LEADS", value: leadData.transferred?.toString() || "0", icon: ArrowRightLeft },
  ]

  const categoryData = [
    { name: "Uncategorized", value: 70 },
    { name: "Study abroad", value: 30 },
  ]


  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [monthlyLeadCount, setMonthlyLeadCount] = useState({
    currentMonthLeads:0,
    prevMonthLeads:0
  })
  const getMonthlyLead = async ()=>{
    try{
      const response = await monthlyWiseCount()
      console.log("--------------", response.data)
      if(response.status) setMonthlyLeadCount(response.data)
    }catch(err){ console.log(err)}
  }
  useEffect(()=>{ getMonthlyLead()},[])
  return (
    <ModernDashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-gray-600 mt-1">Calling features that give you wings that fast.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* come */}
            <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !leadDateRange && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leadDateRange?.from ? (
                        leadDateRange.to ? (
                          <>
                            {format(leadDateRange.from, "dd-MM-yyyy")} to {format(leadDateRange.to, "dd-MM-yyyy")}
                          </>
                        ) : (
                          format(leadDateRange.from, "dd-MM-yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={leadDateRange?.from}
                      selected={leadDateRange}
                      onSelect={setLeadDateRange}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={()=>setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Leads
            </Button>
            <Button variant="ghost" size="icon">
              <div className="w-6 h-6 flex flex-col gap-1">
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
                <div className="w-full h-0.5 bg-gray-600"></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const style = statsStyles[index]
            return (
              <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className="w-4 h-4 text-teal-500">
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="8" r="2" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm">
                        View Details
                      </Button>
                    </div>
                    <div className={`w-16 h-12 ${style.iconBg} rounded-lg flex items-center justify-center`}>
                      <div className="w-8 h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-sm opacity-60">
                        <svg viewBox="0 0 32 24" className="w-full h-full">
                          <path
                            d="M2 20 L8 12 L14 16 L22 8 L30 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className={style.color}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {bottomStatsData.map((stat, index) => {
            const style = bottomStatsStyles[index]
            return (
              <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className="w-4 h-4 text-teal-500">
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="8" r="2" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm">
                        View Details
                      </Button>
                    </div>
                    <div className={`w-16 h-12 ${style.iconBg} rounded-lg flex items-center justify-center`}>
                      <div className="w-8 h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-sm opacity-60">
                        <svg viewBox="0 0 32 24" className="w-full h-full">
                          <path
                            d="M2 20 L8 12 L14 16 L22 8 L30 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className={style.color}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Wise Report */}
          <Card className="bg-white border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              Category Report
                            </CardTitle>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !categoryDateRange && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {categoryDateRange?.from ? (
                                  categoryDateRange.to ? (
                                    <>
                                      {format(categoryDateRange.from, "dd-MM-yyyy")} to{" "}
                                      {format(categoryDateRange.to, "dd-MM-yyyy")}
                                    </>
                                  ) : (
                                    format(categoryDateRange.from, "dd-MM-yyyy")
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <CalendarComponent
                                initialFocus
                                mode="range"
                                defaultMonth={categoryDateRange?.from}
                                selected={categoryDateRange}
                                onSelect={setCategoryDateRange}
                                numberOfMonths={1}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                          {categoryData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: categoryColors[index] }}
                              ></div>
                              <span className="text-sm text-gray-600">{item.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-48 w-full max-w-full overflow-hidden">
                          <ChartContainer
                            config={{
                              uncategorized: { label: "Uncategorized", color: "#4F46E5" },
                              studyAbroad: { label: "Study abroad", color: "#10B981" },
                            }}
                            className="h-full w-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={categoryData.map((item, index) => ({
                                    ...item,
                                    color: categoryColors[index],
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {categoryData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={categoryColors[index]}
                                    />
                                  ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

          {/* Staff Wise Report */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Staff Wise Report</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("justify-start text-left font-normal", !staffDateRange && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {staffDateRange?.from ? (
                        staffDateRange.to ? (
                          <>
                            {format(staffDateRange.from, "dd-MM-yyyy")} to {format(staffDateRange.to, "dd-MM-yyyy")}
                          </>
                        ) : (
                          format(staffDateRange.from, "dd-MM-yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={staffDateRange?.from}
                      selected={staffDateRange}
                      onSelect={setStaffDateRange}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-1">TOTAL LEADS</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{monthlyLeadCount.currentMonthLeads || 0}</div>
                <div className="text-sm text-gray-500">PREVIOUS MONTH LEADS</div>
                <div className="text-xl font-semibold text-gray-700">{monthlyLeadCount.prevMonthLeads || 0}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">Name</th>
                      <th className="text-center py-2 text-gray-600 font-medium">New</th>
                      <th className="text-center py-2 text-gray-600 font-medium">Pending</th>
                      <th className="text-center py-2 text-gray-600 font-medium">Follow</th>
                      <th className="text-center py-2 text-gray-600 font-medium">Rejected</th>
                      <th className="text-center py-2 text-gray-600 font-medium">Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData.map((staff, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: staffColors[index] }}
                            ></div>
                            <span className="text-gray-900">{staff.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3">
                          <span className="text-teal-600 font-medium">{staff.data["new lead"]}</span>
                        </td>
                        <td className="text-center py-3">
                          <span className="text-teal-600 font-medium">{staff.data["pending lead"]}</span>
                        </td>
                        <td className="text-center py-3">
                          <span className="text-blue-600 font-medium">{staff.data["followup lead"]}</span>
                        </td>
                        <td className="text-center py-3">
                          <span className="text-red-600 font-medium">{staff.data["rejected lead"]}</span>
                        </td>
                        <td className="text-center py-3">
                          <span className="text-gray-600 font-medium">{staff.data["closed lead"]}</span>
                        </td>
                      </tr>
                    ))}
                    
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {isAddModalOpen && <AddLeadsModal open={isAddModalOpen} setOpen={setIsAddModalOpen} />}
    </ModernDashboardLayout>
  )
}
