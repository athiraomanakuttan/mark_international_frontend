"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Download, Trash2, Pencil } from "lucide-react"
import type { LeadFilterType, LeadResponse } from "@/types/lead-type"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import AddLeadsModal from "@/components/admin/add-leads-modal"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { getLeads } from "@/service/admin/leadService"
import { LEAD_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUS } from "@/data/Lead-data"
import { MultiSelect } from "@/components/ui/multi-select" // Import the new MultiSelect component

export default function LeadsReportPage() {
  const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
  const [fromDate, setFromDate] = useState<Date | undefined>(yesterday)
  const [toDate, setToDate] = useState<Date | undefined>(new Date())
  // Change state types to arrays for multi-selection
  const [leadCategory, setLeadCategory] = useState<(string | number)[]>([])
  const [leadStatus, setLeadStatus] = useState<(string | number)[]>([])
  const [priority, setPriority] = useState<(string | number)[]>([])
  const [leadSource, setLeadSource] = useState<(string | number)[]>([])
  const [staff, setStaff] = useState<(string | number)[]>([])
  const [createBy, setCreateBy] = useState<(string | number)[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("10")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [leadData, setLeadData] = useState<LeadResponse[]>([])
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0,
  })
  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff)
  
  useEffect(()=>{
    console.log(priority)
  },[priority])

  useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

  const getLeadList = async () => {
    try {
      // Convert selected arrays to comma-separated strings for API if needed
      // For now, only leadStatus is used in getLeads, adjust as per your backend API
      const statusParam = leadStatus.length > 0 ? leadStatus.join(",") : "7" // '7' for All, or empty string if backend expects that
      const response = await getLeads(statusParam, paginationData.currentPage, paginationData.limit,{fromDate, createBy,leadCategory, leadSource, leadStatus, priority, staff, toDate} as LeadFilterType, searchQuery)
      if (response.status) {
        console.log("lead response", response.data)
        setLeadData(response?.data?.lead)
        setPaginationData((prev) => ({
          ...prev,
          totalPages: Math.ceil(response.data?.totalRecords / paginationData.limit),
        }))
      }
    } catch (error) {
      console.log("Error fetching leads:", error)
    }
  }

  useEffect(() => {
    getLeadList()
  }, [leadStatus, paginationData.currentPage, paginationData.limit,fromDate,toDate,leadCategory,leadStatus,priority,leadSource,staff,createBy]) // Add other filter states here when they are used in getLeads

  // Prepare options for MultiSelect components
  const leadCategoryOptions = LEAD_TYPES.map((item) => ({ value: item.value, label: item.name }))
  const leadStatusOptions = LEAD_STATUS.map((item) => ({ value: item.value, label: item.name }))
  const priorityOptions = LEAD_PRIORITIES.map((item) => ({ value: item.value, label: item.name }))
  const leadSourceOptions = LEAD_SOURCES.map((item) => ({ value: item.value, label: item.name }))
  const staffOptions = staffList.map((item) => ({ value: item.id!, label: item.name }))
  const createByOptions = staffList.map((item) => ({ value: item.id!, label: item.name }))

  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6 md:p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Leads Report</h1>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              </div>
            </div>
            {/* Filter Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="grid gap-2">
                <Label htmlFor="from-date">From Date (Created Date)</Label>
                <DatePicker date={fromDate} setDate={setFromDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to-date">To Date (Created Date)</Label>
                <DatePicker date={toDate} setDate={setToDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-category">Lead Category</Label>
                <MultiSelect
                  options={leadCategoryOptions}
                  selected={leadCategory}
                  onChange={setLeadCategory}
                  placeholder="Select categories"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-status">Lead Status</Label>
                <MultiSelect
                  options={leadStatusOptions}
                  selected={leadStatus}
                  onChange={setLeadStatus}
                  placeholder="Select statuses"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <MultiSelect
                  options={priorityOptions}
                  selected={priority}
                  onChange={setPriority}
                  placeholder="Select priorities"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-source">Lead Source</Label>
                <MultiSelect
                  options={leadSourceOptions}
                  selected={leadSource}
                  onChange={setLeadSource}
                  placeholder="Select sources"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff">Staff</Label>
                <MultiSelect options={staffOptions} selected={staff} onChange={setStaff} placeholder="Select staff" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-by">Create By</Label>
                <MultiSelect
                  options={createByOptions}
                  selected={createBy}
                  onChange={setCreateBy}
                  placeholder="Select creators"
                />
              </div>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white mb-6" onClick={getLeadList}>
              View
            </Button>
            {/* Table Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                <Select
                  value={entriesPerPage}
                  onValueChange={(value) => setPaginationData((prev) => ({ ...prev, limit: Number(value) }))}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search:"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px]"
                />
              </div>
            </div>
            {/* Leads Table */}
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox id="select-all" />
                    </TableHead>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone No</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Lead Source</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-24 text-center text-gray-500 dark:text-gray-400">
                        No data available in table
                      </TableCell>
                    </TableRow>
                  ) : (
                    leadData.map((lead, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox id={`select-lead-${index}`} />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.phoneNumber || <span className="text-gray-500">N/A</span>}</TableCell>
                        <TableCell>
                          {LEAD_TYPES.find((data) => data.value === Number(lead.category))?.name || (
                            <span className="text-gray-500">{lead.category}</span>
                          )}
                        </TableCell>
                        <TableCell>{lead.updatedAt}</TableCell>
                        <TableCell>{lead.assignedAgent_name || <span className="text-gray-500">N/A</span>}</TableCell>
                        <TableCell>
                          {LEAD_STATUS.find((data) => data.value === Number(lead.status))?.name || "N/A"}
                        </TableCell>
                        <TableCell>{lead.createdAt || <span className="text-gray-500">N/A</span>}</TableCell>
                        <TableCell>{lead.createdByName || <span className="text-gray-500">N/A</span>}</TableCell>
                        <TableCell>{lead.cost || <span className="text-gray-500">0</span>}</TableCell>
                        <TableCell>
                          {LEAD_SOURCES.find((data) => data.value == Number(lead.leadSource))?.name || (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Bottom Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-700 dark:text-gray-300">
              <span>Showing 0 to 0 of 0 entries</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage === 1}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage >= paginationData.totalPages}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {isAddModalOpen && <AddLeadsModal open={isAddModalOpen} setOpen={setIsAddModalOpen} />}
    </ModernDashboardLayout>
  )
}
