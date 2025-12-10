"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Download } from "lucide-react"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import type { LeadFilterType, LeadResponse } from "@/types/lead-type"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { deletelead, getUnassignedLeads } from "@/service/admin/leadService"
import { LEAD_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUS } from "@/data/Lead-data"
import { MultiSelect } from "@/components/ui/multi-select" 
import { toast } from "react-toastify"
import AssignLeadModal from "@/components/admin/assign-staff-modal"
import { DATA_LIMIT } from "@/data/limitData"

export default function LeadsReportPage() {
  const from = new Date();
from.setDate(from.getDate() - 10);
  const [fromDate, setFromDate] = useState<Date | undefined>(from)
  const [toDate, setToDate] = useState<Date | undefined>(new Date())

  const [leadCategory, setLeadCategory] = useState<(string | number)[]>([])
  const [leadStatus, setLeadStatus] = useState<(string | number)[]>([])
  const [staff, setStaff] = useState<(string | number)[]>([])
  const [createBy, setCreateBy] = useState<(string | number)[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState(DATA_LIMIT[0].toString())
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isUpdateModelOpen, setIsUpdateModelOpen] = useState(false)
  const [selectedLead, setSelectedLead]= useState<LeadResponse>()
  const [selectedLeadList, setSelectedLeadList] = useState<string[]>([])
  const [leadData, setLeadData] = useState<LeadResponse[]>([])
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0,
  })
  
  

  const handleSelectLead = (leadId: string) => {
  if (leadId === "all") {
    // If all leads are currently selected, deselect all
    if (selectedLeadList.length === leadData.length && leadData.length > 0) {
      setSelectedLeadList([])
    } else {
      // Otherwise, select all leads
      const allLeadIds = leadData.map(lead => lead.id)
      setSelectedLeadList(allLeadIds)
    }
  } else {
    // Handle individual lead selection
    if (selectedLeadList.includes(leadId)) {
      // If lead is already selected, remove it
      setSelectedLeadList(prev => prev.filter(id => id !== leadId))
    } else {
      // If lead is not selected, add it
      setSelectedLeadList(prev => [...prev, leadId])
    }
  }
}

  const  handleDelete = async (leadId: string)=>{
    
    try{
      const response = await deletelead(0,[leadId])
      if(response.status){
        toast.success("lead deleted successfull")
        getLeadList()
      }
    }catch(err){
      toast.error("Lead deleted successfull")
    }
  }
  
  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff)
  
 
  useEffect(()=>{
    if(selectedLead)
      setIsUpdateModelOpen(true)
  },[selectedLead])

  useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

  const getLeadList = async () => {
    try {
      const statusParam = leadStatus.length > 0 ? leadStatus.join(",") : "7" // '7' for All, or empty string if backend expects that
      const response = await getUnassignedLeads(statusParam, paginationData.currentPage, paginationData.limit,{fromDate, createBy,leadCategory, leadStatus, staff, toDate} as LeadFilterType, searchQuery)
      if (response.status) {
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
  }, [leadStatus, paginationData.currentPage, paginationData.limit,fromDate,toDate,leadCategory,leadStatus,staff,createBy,searchQuery, isAssignModalOpen,isUpdateModelOpen]) // Add other filter states here when they are used in getLeads

  useEffect(()=>{
    setPaginationData((prev)=>({...prev,currentPage:1}))
  },[fromDate,toDate,leadCategory,leadStatus,staff,createBy,searchQuery])

  // Prepare options for MultiSelect components
  const leadCategoryOptions = LEAD_TYPES.map((item) => ({ value: item.value, label: item.name }))
  const leadStatusOptions = LEAD_STATUS.map((item) => ({ value: item.value, label: item.name }))

const leadAssinedSuccess = ()=>{
    getLeadList()
    setSelectedLeadList([])
}
const handleAssignBtn = ()=>{
    if(selectedLeadList.length<=0){
        toast.error("please select at least one lead")
        return
    }
    setIsAssignModalOpen(true)
}
  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6 w-full max-w-none overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-2 gap-3 sm:gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 order-1">Unassigned Leads</h1>
              <div className="flex flex-col xs:flex-row gap-2 order-2 sm:order-2">
                <Button variant="outline" className="flex items-center justify-center gap-2 bg-transparent text-sm sm:text-base min-w-0">
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span >Export</span>
                </Button>
                <Button
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm sm:text-base min-w-0"
                  onClick={handleAssignBtn}
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xs:inline">Assign Staff</span>
                  <span className="xs:hidden">Assign</span>
                </Button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="grid gap-2">
                <Label htmlFor="from-date" className="text-sm font-medium">From Date (Created Date)</Label>
                <DatePicker date={fromDate} setDate={setFromDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to-date" className="text-sm font-medium">To Date (Created Date)</Label>
                <DatePicker date={toDate} setDate={setToDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-category" className="text-sm font-medium">Lead Category</Label>
                <MultiSelect
                  options={leadCategoryOptions}
                  selected={leadCategory}
                  onChange={setLeadCategory}
                  placeholder="Select categories"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-status" className="text-sm font-medium">Lead Status</Label>
                <MultiSelect
                  options={leadStatusOptions}
                  selected={leadStatus}
                  onChange={setLeadStatus}
                  placeholder="Select statuses"
                />
              </div>
            </div>

            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white mb-4 sm:mb-6 w-full sm:w-auto" onClick={getLeadList}>
              View
            </Button>

            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">Show</span>
                <Select
                  value={entriesPerPage}
                  onValueChange={(value) => setPaginationData((prev) => ({ ...prev, limit: Number(value) }))}
                >
                  <SelectTrigger className="w-16 sm:w-[70px]">
                    <SelectValue placeholder={DATA_LIMIT[0].toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_LIMIT.map(limit =>(
                      <SelectItem value={limit.toString()} key={limit}>{limit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">entries</span>
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
                  className="w-full sm:w-[200px] text-sm"
                />
              </div>
            </div>

            {/* Leads Table */}
            <div className="w-full overflow-x-auto border rounded-md">
  <Table className="min-w-[1200px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 sm:w-[40px] px-2 sm:px-4">
                        <Checkbox id="select-all" onCheckedChange={()=>handleSelectLead("all")}/>
                      </TableHead>
                      <TableHead className="w-12 sm:w-[50px] px-2 sm:px-4">#</TableHead>
                      <TableHead className="min-w-[120px] px-2 sm:px-4">Name</TableHead>
                      <TableHead className="min-w-[120px] px-2 sm:px-4">Phone No</TableHead>
                      <TableHead className="min-w-[100px] px-2 sm:px-4">Category</TableHead>
                      <TableHead className="min-w-[80px] px-2 sm:px-4">Status</TableHead>
                      <TableHead className="min-w-[120px] px-2 sm:px-4">Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-gray-500 dark:text-gray-400 px-2 sm:px-4">
                          No data available in table
                        </TableCell>
                      </TableRow>
                    ) : (
                      leadData.map((lead, index) => (
                        <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                            <Checkbox 
                              id={`select-lead-${index}`} 
                              checked={selectedLeadList.includes(lead.id)}
                              onCheckedChange={() => handleSelectLead(lead.id)}
                            />
                          </TableCell>
                          <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">{index + 1}</TableCell>
                          <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm font-medium">
                            <div className="truncate max-w-[150px] sm:max-w-none" title={lead.name}>
                              {lead.name}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                            <div className="truncate max-w-[120px] sm:max-w-none" title={lead.phoneNumber || "N/A"}>
                              {lead.phoneNumber || <span className="text-gray-500">N/A</span>}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                            <div className="truncate max-w-[100px] sm:max-w-none">
                              {LEAD_TYPES.find((data) => data.value === Number(lead.category))?.name || (
                                <span className="text-gray-500">{lead.category}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                            <div className="truncate max-w-[80px] sm:max-w-none">
                              {LEAD_STATUS.find((data) => data.value === Number(lead.status))?.name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                            <div className="truncate max-w-[120px] sm:max-w-none" title={lead.createdAt || "N/A"}>
                              {lead.createdAt || <span className="text-gray-500">N/A</span>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
            </div>

            {/* Bottom Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 sm:gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-center sm:text-left">
                Showing page {paginationData.currentPage} of {paginationData.totalPages} pages
              </span>
              <div className="flex justify-center sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage === 1}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  className="text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginationData.currentPage >= paginationData.totalPages}
                  onClick={() => setPaginationData((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  className="text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {isAssignModalOpen && <AssignLeadModal leadList={selectedLeadList} open={isAssignModalOpen} setOpen={setIsAssignModalOpen} leadAssinedSuccess={leadAssinedSuccess}  />}
    </ModernDashboardLayout>
  )
}